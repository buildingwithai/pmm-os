import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/gateway/auth";
import { checkRateLimit } from "@/lib/gateway/ratelimit";

/**
 * PMM OS research-gateway — rerank proxy.
 *
 * The plugin's research engine (running on a member's machine) is pointed here via
 * its OpenAI-compatible provider slot. It POSTs an OpenAI Responses-shaped body
 * ({ model, input, ... }) with the member's PMM OS token as Bearer. This route:
 *   1. authenticates the token (server-side allowlist / member lookup)
 *   2. rate-limits per token
 *   3. forwards to the CHEAPEST provider using the REAL key held ONLY in server env
 *   4. returns a body the engine parses (output_text / choices / content)
 *
 * The real provider key (OPENAI_API_KEY) is never sent to, nor derivable by, any
 * client. Callers only ever hold their own PMM OS token.
 *
 * Cheapest model (verified 2026-07-08): gpt-5-nano ($0.05/$0.40 per 1M, ~$0.0002/call).
 * It is a reasoning model: it REJECTS `temperature`, so we strip it and pass
 * reasoning.effort="minimal" for near-deterministic, cheap scoring.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM_URL = "https://api.openai.com/v1/responses";
const FORCED_MODEL = "gpt-5-nano"; // model allowlist of exactly one — clients can't request a pricier model
const MAX_INPUT_CHARS = 200_000; // ~50k tokens; a rerank prompt is far smaller — this is an abuse ceiling
const UPSTREAM_TIMEOUT_MS = 60_000;

function deny(status: number, error: string, extra?: Record<string, unknown>) {
  // No CORS headers: this is a server-to-server endpoint, never called from a browser.
  return NextResponse.json({ error, ...extra }, { status });
}

/** Pull the prompt text out of an OpenAI/XAI Responses `input` (string or message array). */
function extractPrompt(input: unknown): string | null {
  if (typeof input === "string") return input;
  if (Array.isArray(input)) {
    const parts: string[] = [];
    for (const item of input) {
      if (typeof item === "string") parts.push(item);
      else if (item && typeof item === "object") {
        const c = (item as Record<string, unknown>).content;
        if (typeof c === "string") parts.push(c);
        else if (Array.isArray(c)) {
          for (const p of c) {
            const t = p && typeof p === "object" ? (p as Record<string, unknown>).text : undefined;
            if (typeof t === "string") parts.push(t);
          }
        }
      }
    }
    return parts.join("\n") || null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 1. Auth — reject before doing any work.
  const identity = await validateToken(request.headers.get("authorization"));
  if (!identity.ok) return deny(401, "invalid_or_missing_token");

  // 2. Rate limit — keyed by the token's non-secret fingerprint.
  const rl = await checkRateLimit(identity.subject);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", limit: rl.limit, reset: rl.reset },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))) } },
    );
  }

  // 3. Parse + validate the request body.
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return deny(400, "invalid_json");
  }
  const prompt = extractPrompt(body.input);
  if (!prompt) return deny(400, "missing_input");
  if (prompt.length > MAX_INPUT_CHARS) return deny(413, "input_too_large", { max: MAX_INPUT_CHARS });

  // 4. Build the upstream request — force the cheap model, strip client-controlled
  //    knobs (model, temperature, top_p, max_tokens are all ignored/overridden).
  const upstreamBody = {
    model: FORCED_MODEL,
    input: prompt,
    store: false,
    reasoning: { effort: "minimal" }, // gpt-5-nano rejects temperature; this is the determinism/cost lever
  };

  // Mock mode: verify the full path (auth + limit + shape) with no real key.
  // Active when explicitly requested OR when no key is configured yet.
  const realKey = process.env.OPENAI_API_KEY;
  if (process.env.PMM_OS_GATEWAY_MOCK === "1" || !realKey) {
    return NextResponse.json({
      object: "response",
      model: FORCED_MODEL,
      output_text: "[gateway-mock] ok — set OPENAI_API_KEY in server env to enable live rerank",
      _mock: true,
      _rate: { remaining: rl.remaining, backend: rl.backend },
    });
  }

  // 5. Forward with the REAL key (server env only — never logged, never returned).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${realKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamBody),
      signal: controller.signal,
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      // Do NOT leak the upstream error body (may echo request details); log server-side, return generic.
      console.error(`[research-gateway] upstream ${upstream.status}`);
      return deny(502, "upstream_error", { upstreamStatus: upstream.status });
    }
    // Pass the provider's JSON through unchanged — the engine's parser reads output_text/choices/content.
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return deny(aborted ? 504 : 502, aborted ? "upstream_timeout" : "upstream_unreachable");
  } finally {
    clearTimeout(timer);
  }
}

// Explicitly refuse other methods (no accidental GET surface).
export async function GET() {
  return deny(405, "method_not_allowed");
}
