"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export function CloudWaitlistForm({ source = "cloud-page" }: { source?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/cloud/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("success");
      } else {
        setState("error");
        setMessage(
          data.error === "invalid_email"
            ? "That doesn't look like an email address — check it and try again."
            : data.error === "too_many_requests"
              ? "Too many attempts — give it a minute and try again."
              : "Something went wrong on our side. Try again in a moment.",
        );
      }
    } catch {
      setState("error");
      setMessage("Couldn't reach the server — check your connection and try again.");
    }
  }

  if (state === "success") {
    return (
      <div aria-live="polite" className="ut-waitlist-success" role="status">
        <CheckCircle2 aria-hidden="true" size={20} />
        <span>
          You&apos;re on the list. We&apos;ll email <strong>{email}</strong> when Cloud opens.
        </span>
      </div>
    );
  }

  return (
    <form className="ut-waitlist-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={`waitlist-email-${source}`}>
        Email address
      </label>
      <input
        autoComplete="email"
        disabled={state === "submitting"}
        id={`waitlist-email-${source}`}
        inputMode="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        required
        type="email"
        value={email}
      />
      <button className="ut-button ut-button-primary" disabled={state === "submitting"} type="submit">
        {state === "submitting" ? (
          <>
            <LoaderCircle aria-hidden="true" className="ut-spin" size={17} />
            Joining…
          </>
        ) : (
          <>
            Join the waitlist
            <ArrowRight size={17} />
          </>
        )}
      </button>
      {state === "error" ? (
        <p aria-live="polite" className="ut-waitlist-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
