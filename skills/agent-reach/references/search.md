<!-- PMM-OS-REACH-TRIM: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file also compared Exa against a Chinese search MCP that this plugin
     does not ship — pointing the model at tooling that is not installed. -->

# Search — Exa

**This is one of the four things agent-reach uniquely adds.** Strong on English
technical content and code.

```bash
mcporter call 'exa.web_search_exa(query: "query", numResults: 5)'
mcporter call 'exa.get_code_context_exa(query: "code question", tokensNum: 3000)'
```

| Use | Call |
|-----|------|
| Web search | `web_search_exa(query: "...", numResults: 5)` |
| Code / repo context | `get_code_context_exa(query: "...", tokensNum: 3000)` |

> **The free MCP tier rate-limits, and `agent-reach doctor` cannot see it.** Measured
> 2026-07-30: doctor reported `exa_search: ok` while the exact call above returned
> HTTP 429, "You've hit Exa's free MCP rate limit". Doctor proves the backend is
> INSTALLED, never that a query returns data. Set `EXA_API_KEY` for a real quota, and
> treat a 429 as a failed fetch — never as "nothing found on this topic".

## When to use something else

| Need | Better lane |
|-----|---------|
| Read one known URL | `curl -s https://r.jina.ai/URL` (free, keyless) |
| What people are SAYING about X | `last30days` — engagement-ranked, not relevance-ranked |
| Repositories and code | `gh search` — see [dev.md](dev.md) |
