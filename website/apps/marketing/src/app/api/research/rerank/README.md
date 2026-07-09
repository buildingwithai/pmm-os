# Research gateway — `/api/research/rerank`

An OpenAI-compatible proxy that lets the PMM OS plugin's research engine run its LLM
relevance-reranker **without any member holding a real provider key**. The plugin POSTs
an OpenAI Responses-shaped body with the member's PMM OS token; this route authenticates
it, rate-limits per token, and forwards to the cheapest model using a key held **only in
server env**.

## Request/response contract

- **In:** `POST` with `Authorization: Bearer <PMM_OS_TOKEN>` and body
  `{ "model": <ignored>, "input": "<prompt>" | [{role,content}], ... }`.
- **Out:** the upstream provider's JSON, which the engine parses (`output_text` / `choices`
  / `content`). Errors: `401` (bad token), `429` (rate limited, with `Retry-After`),
  `400`/`413` (bad/oversized input), `502`/`504` (upstream).

## Provider

Forced server-side to **`gpt-5-nano`** (verified 2026-07-08 cheapest at $0.05/$0.40 per 1M,
≈$0.0002/rerank call). It's a reasoning model that rejects `temperature`, so the route
strips it and sends `reasoning.effort="minimal"`. Clients cannot request a pricier model —
the model is a one-item allowlist.

## Server env vars (set in Vercel → Project → Settings → Environment Variables)

| Var | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | **yes (prod)** | the REAL upstream key. Server-only; never returned, never logged. Absent ⇒ route runs in mock mode. |
| `PMM_OS_GATEWAY_TOKENS` | **yes** | comma-separated allowlist of valid member tokens (beta). Swap for a Neon/Clerk member lookup in `src/lib/gateway/auth.ts`. |
| `UPSTASH_REDIS_REST_URL` | prod | Upstash Redis REST URL for durable per-token rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | prod | Upstash Redis REST token. (Vercel Marketplace Upstash may inject `KV_REST_API_URL`/`KV_REST_API_TOKEN` — both are read.) |
| `PMM_OS_RATE_PER_MIN` | no | requests/min/token (default 60). |
| `PMM_OS_GATEWAY_MOCK` | no | `1` forces mock mode even with a real key (for testing). |

**Without `UPSTASH_*`** the limiter falls back to per-instance in-memory (best-effort only;
logs a warning in production). Set Upstash for real protection across serverless instances.

## Security posture

- Real provider key server-only; members hold only their own PMM OS token.
- Model + params forced server-side (no client-chosen expensive model/knobs).
- Auth before any work; constant-time token compare; token never logged (only a
  non-reversible 16-char fingerprint).
- Input size ceiling (413); POST-only (405 otherwise); no CORS (server-to-server).
- Upstream error bodies never proxied to the caller (generic 502 + server-side log).

## Client wiring

Members connect with: `npx pmm-os research-connect <this-url> <their-token>`
(writes the engine's config; the real key never touches the client). Revert:
`npx pmm-os research-disconnect`.
