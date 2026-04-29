# Fix SonarCloud Issues

Follow **Phase B — Fix** in `.claude/skills/sonarcloud-remediation.md`.

1. Run `/sonarcloud-analyze` first if no analysis has been done in this session
2. Engineer selects group(s) to fix from the analyze output
3. Read affected files, present fixes as a group for approval
4. Apply approved fixes (cap ~200 LOC per PR, auto-split larger groups)
5. Validate: `npm run tsc` and `npm run vitest` must both pass (hard gate)
6. Create branch, commit, and PR following `.github/pull_request_template.md`
7. Post `/run-playwright` comment on the PR
8. Offer to continue with the next group
