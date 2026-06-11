# Development of RBAC features

### EDA server's `feature/rbac` branch

The EDA backend is currently being updated to support new RBAC features based on the RBAC library in [django-ansible-base](https://github.com/alancoding/django-ansible-base/blob/django_permissions/docs/apps/rbac.md).

The changes are being developed in the `feature/rbac` branch of [eda-server](https://github.com/ansible/eda-server/tree/feature/rbac). Key updates:

1. New `RBAC` endpoints for role definitions and role assignments.
2. Requiring an `organization` field during the creation of EDA resources.
3. `/organizations` and `/teams` endpoints.

`feature/rbac` is not going to be merged into EDA's main branch for a while. This document outlines the process we can follow for developing EDA's RBAC related UIs while utilizing features from eda-server's `feature/rbac` branch.

### Developing UIs against EDA's RBAC backend server:

1. Check out feature branches in `ansible-ui` as per the normal development process.
2. Implement RBAC relevant UIs using the EDA `feature/rbac` server https://eda.dev-feature-rbac.gcp.testing.ansible.com/ for development and testing. (check #aap-ci-bots-eda for credentials)
3. Open PRs against `ansible-ui`'s main branch.
4. Testing checklist for creating and reviewing PRs:
   - Add relevant component tests alongside UI updates.
   - Manually run all E2E tests against the EDA `feature/rbac` server and make necessary updates to get the tests to pass in manual test runs. Add new E2E tests as needed.
   - Run the E2E tests a couple of times to help catch flaky tests.
   - **Commenting out tests:** Since the PR builds in `ansible-ui` run against the EDA server served up by [eda-server's main branch](https://github.com/ansible/eda-server/tree/main), it's expected that some E2E tests could fail where the UI is updated to work with endpoints that are only supported in the `feature/rbac` branch. In these cases, we may need to temporarily turn off specific tests to allow these PRs to merge and flow downstream for further development. New E2E tests based on EDA's `feature/rbac` branch are also likely to fail on the main branch and may need to be commented out to facilitate merging code.
     **_Note:_** We will revisit commented and skipped tests and work on re-enabling them after the eda-server `feature/rbac` is merged into `main`.
