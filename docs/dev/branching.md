# Branching

> As outlined in previous decision records, we have adopted a structured 8-week release cycle with a hardening sprint and hackathon process at the end of each cycle to ensure that all new feature/function code is properly tested and validated before being included in a release.

> To accommodate urgent fixes, we reinstated the bi-weekly async release model, but only for CVEs and defects. However, to ensure this process does not introduce instability, it is essential that component teams follow strict branch management practices.

## 8 Week Release Schedule

### Sprint 1

- Features go into `main`
- Defects go into `main`
- Critical defects cherry-picked to `release`
- At the end of sprint - `release` is tagged for an async release

### Sprint 2

- Features go into `main`
- Defects go into `main`
- Critical defects cherry-picked to `release`
- At the end of sprint - `release` is tagged for an async release

### Sprint 3

- Features go into `main`
- Defects go into `main`
- At the end of sprint - `main` merged into `release` (Contains all feature and fixes from main)

### Hardening Sprint

- Hackathon of `release` (Contains all feature and fixes from main)
- Hackathon defects go into `main`
- Hackathon defects cherry-picked to `release`
- At the end of sprint - `release` is tagged and released with new features
