<!-- PMM-OS-REACH-TRIM: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file's tool-comparison table named MCP servers this plugin does not
     ship. -->

# Web pages and RSS

RSS is one of the four things agent-reach uniquely adds. Page reading is free and
keyless via Jina.

## Any web page (Jina Reader)

```bash
curl -s "https://r.jina.ai/URL"
curl -s "https://r.jina.ai/https://example.com/article"
```

Free, keyless, and the default for most pages. `reach.sh read <url>` wraps this.

## Web Reader (MCP) — when output format matters

```bash
mcporter call 'web-reader.webReader(url: "https://example.com")'
mcporter call 'web-reader.webReader(url: "https://example.com", retain_images: true)'
mcporter call 'web-reader.webReader(url: "https://example.com", return_format: "text")'
```

## RSS (feedparser)

```python
python3 -c "
import feedparser
for e in feedparser.parse('FEED_URL').entries[:5]:
    print(f'{e.title} — {e.link}')
"
```

For blogs, newsrooms, changelogs and podcasts. This is the lane nothing else here has.

| Need | Tool |
|-----|---------|
| A normal page | Jina Reader (`curl r.jina.ai`) |
| Images or an exact output format | web-reader MCP |
| A feed | feedparser |

> A paywall, a 403 or a Cloudflare challenge is a BLOCK. Jina returns a short body or
> an error page rather than the article; check the length before quoting it, and say
> the page was unreachable rather than summarising the interstitial.
