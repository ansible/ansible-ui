# SonarCloud dual-project sync (ansible-ui ↔ aap-ui)

Upstream PRs analyze against **ansible** / [`ansible_ansible-ui`](https://sonarcloud.io/project/overview?id=ansible_ansible-ui).
Release backports on [aap-ui](https://github.com/ansible-automation-platform/aap-ui) analyze against **ansible-automation-platform** / [`ansible-automation-platform_aap-ui`](https://sonarcloud.io/project/overview?id=ansible-automation-platform_aap-ui).

Those are separate SonarCloud projects. CI passes `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY` from GitHub Actions variables; everything else should stay in lockstep so the same patch gets the same result.

## Goals

1. **Same quality gate conditions** on both projects (including “no new issues”).
2. **Same TypeScript and JavaScript quality profiles** (same active/deactivated rules — Keith’s profile exclusions must exist on both sides).
3. **Same `sonar-project.properties` analysis parameters** in both repos (exclusions, CPD skip paths, LCOV paths).
4. **Same PR scan behavior** in CI (coverage artifacts, scan action version).

## Phases

| Phase | Owner | Work |
| --- | --- | --- |
| **0 — Audit** | Dev + Sonar admin | Run `scripts/compare-sonarcloud-projects.py` with `SONARCLOUD_TOKEN`. Record gate + profile diffs. Confirm [#3163](https://github.com/ansible-automation-platform/aap-ui/pull/3163) rule keys vs [#3844](https://github.com/ansible/ansible-ui/pull/3844). |
| **1 — SonarCloud UI** | Sonar admin (both orgs) | Copy upstream TS/JS profile to downstream (or export/import). Assign shared gate name (e.g. **AAP UI**) with identical conditions on both projects. |
| **2 — Git** | CI maintainers | Keep `sonar-project.properties` identical in both repos (see canonical file on `devel`). Cherry-pick to aap-ui `main` and active `stable-*` branches. |
| **3 — Validate** | Author of backport | Re-run analysis on [aap-ui #3163](https://sonarcloud.io/dashboard?id=ansible-automation-platform_aap-ui&pullRequest=3163); expect parity with upstream (0 new issues if upstream had 0). |
| **4 — Govern** | Team | Any profile or gate change requires a ticket that updates **both** orgs; re-run compare script before closing. |

## Repo mapping

| Repository | GitHub Actions vars | Sonar dashboard |
| --- | --- | --- |
| [ansible/ansible-ui](https://github.com/ansible/ansible-ui) | `SONAR_ORGANIZATION=ansible`, `SONAR_PROJECT_KEY=ansible_ansible-ui` | [ansible_ansible-ui](https://sonarcloud.io/project/overview?id=ansible_ansible-ui) |
| [ansible-automation-platform/aap-ui](https://github.com/ansible-automation-platform/aap-ui) | `SONAR_ORGANIZATION=ansible-automation-platform`, `SONAR_PROJECT_KEY=ansible-automation-platform_aap-ui` | [ansible-automation-platform_aap-ui](https://sonarcloud.io/project/overview?id=ansible-automation-platform_aap-ui) |

Do **not** commit `sonar.projectKey` / `sonar.organization` in ansible-ui; CI supplies them. aap-ui may keep them in `sonar-project.properties` for local runs — analysis parameters below the key lines must still match.

## Analysis parameters (not quality profile)

| Parameter | Purpose |
| --- | --- |
| `sonar.cpd.exclusions` | Skips copy-paste detection under `framework/`, `frontend/`, `platform/` (in git on both sides). |
| Quality profile rule deactivations | UI-only (e.g. duplicate blocks, duplicate strings). **Must be synced manually** — they do not flow downstream automatically. |

## Compare script

Requires a SonarCloud token with access to **both** organizations:

```bash
export SONARCLOUD_TOKEN='…'
python3 scripts/compare-sonarcloud-projects.py
```

Optional overrides:

```bash
export SONAR_UPSTREAM_ORGANIZATION=ansible
export SONAR_UPSTREAM_PROJECT_KEY=ansible_ansible-ui
export SONAR_DOWNSTREAM_ORGANIZATION=ansible-automation-platform
export SONAR_DOWNSTREAM_PROJECT_KEY=ansible-automation-platform_aap-ui
```

The script prints quality gate names, profile names per language, and rule differences between upstream and downstream profiles.

## Sync canonical profile via API (Keith: `aap-ui-special`)

SonarCloud supports **backup/restore** across organizations. Restore updates activations from the XML but may **not** deactivate extra rules on the target profile, so use the sync script (restore + reconcile):

```bash
export SONARCLOUD_TOKEN='…'   # Administer Quality Profiles on both orgs

# Preview reconcile diff only
python3 scripts/sync-sonar-quality-profile.py --language ts --dry-run
python3 scripts/sync-sonar-quality-profile.py --language js --dry-run

# Apply: backup aap-ui-special → restore to aap org → deactivate stragglers on AAP UI
python3 scripts/sync-sonar-quality-profile.py --language ts
python3 scripts/sync-sonar-quality-profile.py --language js
```

Save XML for audit: `--save-backup aap-ui-special-ts.xml`

Manual alternative: **Policies → Quality profiles → ⋯ → Back up** on `ansible`, then **Restore** in `ansible-automation-platform` (same UI flow as the API).

## Checklist for Keith / Sonar admins (phase 1)

- [ ] In SonarCloud, open **ansible_ansible-ui** → Quality Profiles → note TS + JS profile names and **deactivated** rules (especially duplication-related).
- [ ] Apply the same deactivations to **ansible-automation-platform_aap-ui** (duplicate profile or Sonar “extend + copy”).
- [ ] Align quality gate conditions on both projects.
- [ ] Post compare-script output in the sync ticket when done.

## Related

- PR checks: `.github/workflows/platform-pull-request.yml`, `.github/workflows/sonar_pr.yml`
- Issue triage skill: `.agents/skills/sonarcloud-remediation/`
