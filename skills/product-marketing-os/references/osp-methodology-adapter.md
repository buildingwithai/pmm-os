# OSP Technical Marketing Adapter

Open Strategy Partners provides an MCP-oriented set of technical marketing tools. Use this adapter for developer-facing products, infrastructure products, API products, devtools, security tools, data products, and complex B2B SaaS.

## What to use it for

- Product value maps
- Positioning statements across market, technical, UX, and business dimensions
- Persona and value-case organization
- Metadata for web content
- Technical writing reviews
- Semantic editing codes
- On-page SEO and structured content improvement

## Product value map output

```markdown
# OSP-Style Product Value Map: [Product]

## Tagline
## Position statements
### Market position
### Technical position
### UX position
### Business position

## Personas
| Persona | Role | Challenge | Need | Success metric |

## Value cases
| Use case | Pain | Capability | Outcome | Proof |

## Feature hierarchy
| Category | Area | Feature | Value case |

## Consistency checks
- Does each feature connect to a value case?
- Does each value case connect to a persona need?
- Does each positioning claim have proof?
```

## Metadata output

```markdown
# Metadata Brief
Primary keyword:
Search intent:
H1:
Meta title: [50-60 characters]
Meta description: [155-160 characters]
Slug:
Internal links:
Structured data recommendation:
```

## Editing review output

```markdown
# OSP Editing Review
## Scope and narrative
## Flow and readability
## Style and phrasing
## Word choice and grammar
## Technical accuracy
## Inclusive language
## Before and after examples
## Priority fixes
```

## MCP recommendation

Connect the upstream `osp_marketing_tools` MCP when the user is doing technical content, positioning, metadata, or editing work. Keep it separate from this plugin's bundled MCP because it has its own license and methodology package.

## Attribution and license note

This adapter is inspired by Open Strategy Partners' public OSP Marketing Tools. If you copy, adapt, or distribute substantial OSP-originated material, preserve attribution and comply with CC BY-SA 4.0.
