# Analytics Privacy Review

## Scope

The dashboard and marketing apps now send real analytics data to Convex when
`NEXT_PUBLIC_ANALYTICS_PROVIDER=convex`.

## Data Collected

- Page path, page title, hostname, referrer, language, screen size.
- Session id generated in browser `sessionStorage`.
- Browser, OS, and device type derived from user agent on the server.
- Custom interaction events for clicked links and buttons.
- Performance metrics such as LCP, FCP, TTFB, CLS, DOM Content Loaded, and Page Load.
- Replay-style events: pageview, scroll position, click coordinates, resize,
  browser error message, and input field value length.

## Data Not Collected

- No typed input values are stored.
- No passwords, emails, or text field contents are stored by replay capture.
- No DOM snapshots are stored.
- No cookies are stored in analytics payloads.
- No Clerk user identity is attached unless a future authenticated caller
  explicitly provides `userId`.

## Privacy Defaults

- Replay input events store `valueLength` only.
- Click targets are limited to short labels from tag, id, test id, aria label,
  or short visible text.
- Server route payloads are length-limited before writing to Convex.
- Replay snapshots are capped at 500 events and 200 KB per write.

## Release Requirements

- Add consent/notice before using replay in production.
- Add an environment kill switch before public launch if replay becomes enabled
  by default.
- Decide retention duration and deletion/export policy for analytics records.
- Add server-side organization/site authorization before multi-tenant use.
