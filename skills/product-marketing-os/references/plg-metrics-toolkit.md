# PLG Metrics Toolkit

## Funnel stages

| Stage | Common metrics | Questions |
|---|---|---|
| Acquisition | visitors, signups, signup conversion, source quality | Are we attracting the right users? |
| Activation | activation rate, AHA completion, time to value | Do users reach value fast enough? |
| Engagement | WAU/MAU, key action frequency, feature adoption | Does the product become a habit? |
| Conversion | free-to-paid, trial-to-paid, paywall conversion | Does value translate into revenue? |
| Retention | D7, D30, logo retention, cohort decay | Do users keep coming back? |
| Expansion | seats, usage, upgrade rate, ARPA, NRR | Does usage expand over time? |
| Referral | invites sent, invite acceptance, viral coefficient | Does usage create distribution? |

## PQL/PQA signal examples

- Activated within target time window
- Hit key usage threshold
- Invited teammates
- Connected an integration
- Reached usage limit
- Used high-intent feature
- Returned across multiple sessions
- Account has multiple active users
- Added billing or admin user

## Metric tree template

```text
North Star Metric
  -> acquisition inputs
  -> activation inputs
  -> engagement inputs
  -> conversion inputs
  -> retention inputs
  -> expansion inputs
  -> referral inputs
```

## Guardrails

Do not design a PLG motion without instrumentation. If the product cannot observe activation, usage, or account-level behavior, the first recommendation should be measurement setup.
