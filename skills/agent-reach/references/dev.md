<!-- PMM-OS-REACH-TRIM: translated and trimmed by scripts/patch-agent-reach-trim.py.
     The upstream file's tool-comparison table named MCP servers this plugin does not
     ship. -->

# Dev — GitHub CLI

`gh` covers repos, issues, PRs, Actions, releases and the raw API. `reach.sh gh-search`
and `reach.sh gh-read` wrap the common cases; `last30days` also has its own GitHub
source, engagement-ranked.

```bash
# Auth
gh auth login
gh auth status

# Search
gh search repos "query" --sort stars --limit 10
gh search code "query" --language python

# Repos
gh repo view owner/repo
gh repo clone owner/repo
gh repo fork owner/repo --clone
gh repo sync owner/repo

# Issues
gh issue list -R owner/repo --state open
gh issue view 123 -R owner/repo
gh issue create -R owner/repo --title "Title" --body "Body"

# Pull requests
gh pr list -R owner/repo --state open
gh pr view 123 -R owner/repo
gh pr checks 123 --repo owner/repo

# Actions / CI
gh run list --repo owner/repo --limit 10
gh run view <run-id> --repo owner/repo --log-failed
gh workflow list --repo owner/repo

# Releases
gh release list -R owner/repo

# Raw API
gh api /user
gh api repos/owner/repo

# JSON output (best for an agent)
gh issue list --repo owner/repo --json number,title --jq '.[] | "\(.number): \(.title)"'
```

> **Unauthenticated GitHub search is 60 requests/hour and returns HTTP 403 past it.**
> `gh auth login`, or set `GITHUB_TOKEN`. A 403 here is a rate limit, not an empty
> repository landscape.
