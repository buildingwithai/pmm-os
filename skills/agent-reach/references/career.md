<!-- PMM-OS-REACH-TRIM: translated and trimmed by scripts/patch-agent-reach-trim.py. -->

# Career — LinkedIn and jobs

**This is one of the four things agent-reach uniquely adds.** Nothing else in PMM OS
reaches LinkedIn.

```bash
# A person's profile
mcporter call 'linkedin-scraper.get_person_profile(linkedin_url: "https://linkedin.com/in/username")'

# People search
mcporter call 'linkedin-scraper.search_people(keyword: "AI engineer", limit: 10)'

# A company profile
mcporter call 'linkedin-scraper.get_company_profile(linkedin_url: "https://linkedin.com/company/xxx")'

# Job search
mcporter call 'linkedin-scraper.search_jobs(keyword: "software engineer", limit: 10)'
```

> **Needs a logged-in session.** The scraper reuses LinkedIn login state; without it
> every call returns an auth error. That is a BLOCK, not an empty result — never
> report "no LinkedIn presence" from a failed fetch.

### Fallback when the MCP server is unavailable

```bash
curl -s "https://r.jina.ai/https://linkedin.com/in/username"
```

> Jina reads the logged-out public view, which is a fraction of the profile. Say which
> one you used; the two are not interchangeable evidence.

### Related, but not this lane

`last30days` has its own keyless **jobs** source (public ATS boards — Greenhouse, Lever
and friends). For hiring signals as a market indicator, prefer that: it is free, needs
no login, and returns structured postings. Use LinkedIn here for named people and
companies.
