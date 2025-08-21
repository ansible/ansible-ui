# Backporting Guidelines

We have the `main` branch and the `release/2.5-lts` branch. In the future, we might have more branches for other releases.

Not all fixes added to the `main` branch are backported to the `release/2.5-lts` branch or to other branches.

For example, if a customer reports a bug in the `2.5` release, we fix it in the `main` branch, then backport the fix to `release/2.5-lts` so we can provide a fast resolution for the customer.

## Criteria to Backport a Fix

- **Customer-reported issues (2.5)**: If an issue is reported by a customer using `2.5`, we should backport it, since it directly affects them. We need to address the issue on the main branch first, then backport it to the `release/2.5-lts` branch.
- **Major issues**: Any issue that affects the usability of the UI—such as crashes—must also be backported.
- **Other fixes**: These are “nice to have,” but if we backport every single fix, it creates double the work. It will be up to the discretion of the team to decide which fixes to backport. Those will be nice to have, but not mandatory.

### Future Approach

Ideally, we should be shipping our code from the `main` branch, with new features hidden behind a feature flag. However, we are not there yet.

### JIRA Label: `2.5-next`

We have the `2.5-next` label in JIRA, which has led to some confusion. It was intended to prioritize work for `2.5`, implying that everything else would be addressed later—not necessarily in the `2.5` release.
