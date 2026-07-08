#!/usr/bin/env python3
"""Wire X / Instagram / TikTok from the browser sessions you're ALREADY logged into.

No passwords touch PMM OS — this reads your own browser's session cookies locally
(browser_cookie3) and hands them to the local engines:
  X        → AUTH_TOKEN + CT0 written to ~/.config/last30days/.env  (last30days reads these)
  Instagram→ an instaloader session file (~/.config/instaloader/session-<user>)
  TikTok   → msToken saved to ~/.config/pmm-os/tiktok_ms_token       (TikTokApi reads it)

For any site you're NOT logged into, it prints the login URL so you sign in once in
your browser, then re-run. Usage:  social_setup.py [x|ig|tiktok|all]   (default: all)
"""
import os, sys, pathlib

BROWSERS = ["chrome", "brave", "arc", "edge", "vivaldi", "firefox", "safari"]
CFG = pathlib.Path.home() / ".config"


def _cookies(domain, key):
    """Return (cookiejar, browser_name) for the first browser logged into `domain` (has `key`)."""
    try:
        import browser_cookie3 as bc
    except ImportError:
        print("  ! browser_cookie3 not installed (pip install browser_cookie3)"); return None, None
    for b in BROWSERS:
        fn = getattr(bc, b, None)
        if not fn:
            continue
        try:
            cj = fn(domain_name=domain)
            if any(c.name == key for c in cj):
                return cj, b
        except Exception:
            continue
    return None, None


def setup_x():
    cj, b = _cookies("x.com", "auth_token")
    if not cj:
        print("  ✗ X: not logged in → open https://x.com and sign in, then re-run."); return False
    c = {ck.name: ck.value for ck in cj}
    auth, ct0 = c.get("auth_token"), c.get("ct0")
    if not (auth and ct0):
        print(f"  ✗ X: found a session in {b} but missing ct0 — reload x.com once, then re-run."); return False
    env = CFG / "last30days" / ".env"; env.parent.mkdir(parents=True, exist_ok=True)
    lines = [l for l in (env.read_text().splitlines() if env.exists() else [])
             if not l.startswith(("AUTH_TOKEN=", "CT0="))]
    lines += [f"AUTH_TOKEN={auth}", f"CT0={ct0}"]
    env.write_text("\n".join(lines) + "\n"); os.chmod(env, 0o600)
    print(f"  ✓ X: wired from {b} → last30days (token stays local, not printed)."); return True


def setup_ig():
    cj, b = _cookies("instagram.com", "sessionid")
    if not cj:
        print("  ✗ Instagram: not logged in → open https://instagram.com and sign in, then re-run."); return False
    try:
        import instaloader
    except ImportError:
        print("  ! instaloader not installed (pip install instaloader)"); return False
    L = instaloader.Instaloader(quiet=True)
    L.context._session.cookies.update(cj)
    try:
        user = L.test_login()
    except Exception as e:
        print(f"  ✗ Instagram: session from {b} didn't validate ({type(e).__name__}) — reload instagram.com, re-run."); return False
    if not user:
        print(f"  ✗ Instagram: session from {b} not valid — log into instagram.com, re-run."); return False
    L.context.username = user
    L.save_session_to_file()
    print(f"  ✓ Instagram: wired from {b} as @{user} → instaloader session (no password needed)."); return True


def setup_tiktok():
    cj, b = _cookies(".tiktok.com", "msToken")
    if not cj:
        print("  • TikTok: search works without login; logging into tiktok.com makes it more reliable "
              "(open https://www.tiktok.com, then re-run)."); return False
    tok = next((ck.value for ck in cj if ck.name == "msToken"), None)
    if not tok:
        return False
    out = CFG / "pmm-os"; out.mkdir(parents=True, exist_ok=True)
    (out / "tiktok_ms_token").write_text(tok); os.chmod(out / "tiktok_ms_token", 0o600)
    print(f"  ✓ TikTok: msToken captured from {b} → more reliable search."); return True


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    print("── Wiring social research from your browser sessions (no passwords) ──")
    runners = {"x": setup_x, "ig": setup_ig, "tiktok": setup_tiktok}
    for k, fn in runners.items():
        if which in ("all", k):
            fn()
    print("Re-run after logging into any site you skipped. Check: reach.sh social-status")


if __name__ == "__main__":
    main()
