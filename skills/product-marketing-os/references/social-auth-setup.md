# Signing into X, Instagram, and TikTok (for social research)

**PMM OS never sees or stores your passwords.** There is no field where you type a password
into the plugin. Instead it reads the sessions you're *already* logged into in your browser.

## The easy way (recommended): one command, no passwords

1. In your normal browser, **stay logged into** the sites you want: `x.com`, `instagram.com`,
   `tiktok.com`.
2. Run:

   ```bash
   bash skills/agent-reach/scripts/reach.sh social-setup
   ```

   It reads those sessions **locally** (via `browser_cookie3`) and wires each engine:
   X → `last30days` (`auth_token`/`ct0`), Instagram → an `instaloader` session, TikTok → a
   reliability token. Cookies are written to private (`0600`) files on your machine and never
   leave it. For any site you're not logged into, it prints the login URL — sign in, re-run.

Check status anytime: `reach.sh social-status`. (On first plugin run, the session-start hook
auto-installs the software; this `social-setup` step is the only thing you do by hand, once.)

## Manual / per-channel details (if you prefer, or `social-setup` can't read a browser)

## X / Twitter — no password, just a logged-in tab

The engine reads the auth cookie from your browser. So:

1. **Stay logged into x.com** in Chrome, Brave, Safari, or Firefox (the browser you normally use).
2. That's it — `last30days` and `reach.sh` auto-detect the cookie.

Notes:
- **macOS Safari** needs the terminal/app to have **Full Disk Access** (System Settings →
  Privacy & Security → Full Disk Access) to read its cookie store. Chrome/Brave work without it.
- If X still shows "off": confirm you're actually logged in, or set `AUTH_TOKEN` + `CT0`
  (from x.com → DevTools → Application → Cookies) as env vars.
- Verify: `scripts/verify-research.sh --smoke` shows live X status.

## Instagram — one-time login (you type your password into instaloader, not into PMM OS)

Instagram blocks anonymous search, so you log in once. The password goes to `instaloader`,
which stores an **encrypted session file** that doesn't expire — you won't be asked again.

```bash
bash skills/agent-reach/scripts/reach.sh ig-login YOUR_IG_USERNAME
# instaloader prompts for your password (2FA supported). Done once.
```

Important (Instagram is strict):
- **Run on a local, residential IP** — never a cloud/Vercel/datacenter IP; IG blocks those.
- **Use a secondary account**, not your main — IG can flag accounts used for scraping.
- Keep volume low. The helpers cache results 6h and pace requests (~200/hr cap) so a normal
  desk run stays well within limits — see `research-engines.md` → *Social search rate-limit strategy*.

## After signing in

- `reach.sh tiktok-search <hashtag>` · `reach.sh ig-search <hashtag>` · X flows into `last30days`.
- Re-run `reach.sh social-status` to confirm. You only do this setup once per machine.
