This should help translating from the ansible-hub-ui way of doing things to the ansible-ui ways.

## Hub differences

### Visual

Almost all modals become full screen forms,  
any alerts when submitting a form show up in a fixed alert above the submit/cancel buttons,  
and most actions can now be run in bulk for the whole selection,  
thus most actions no longer show alerts on success/failure, instead always showing a progress modal for all tasks (even 1), with status there.  
This also means no task alerts.  
Loading errors should use an error empty state when loading for the whole screen, but can still use alerts for other issues.

| | |
|-|-|
|![20230613124746](https://github.com/ansible/ansible-ui/assets/289743/6d3e3e56-8a5d-4348-ab04-e503fac84765)|![20230613124825](https://github.com/ansible/ansible-ui/assets/289743/f8cabe3d-1915-4504-9b88-6b2d406c3a06)|

Tabs live *under* the header now, instead of being part of it.  
All list screens now have 3 modes by default (grid, table, list), using a shared `PageTable` component.

### Structural

`npm run start-standalone` -> `npm run hub`

Don't fork the repo, just clone it => still pushing to `origin`, but origin is shared, don't forget to name your branches with a consistent unique prefix (such as `himdel-whatever`).

Naming conventions..
* `src/components/approve-modal/approve-modal.tsx` -> `frontend/hub/approvals/ApproveModal.tsx`
* `src/containers/certification-dashboard/certification-dashboard.tsx` -> `frontend/hub/approvals/Approvals.tsx`
* `src/api/pulp.ts` -> `frontend/hub/usePulpView.tsx`
* `test/cypress/e2e/` -> `cypress/e2e/hub/`

No default exports, no `index.tsx` files.

The primary testing method is now cypress component tests (https://docs.cypress.io/guides/component-testing/overview), `frontend/hub/dashboard/Dashboard.tsx` is tested by `frontend/hub/dashboard/Dashboard.cy.tsx`. This is not talking to real APIs, tests should mock any API calls.

E2E tests also exist, in `cypress/e2e/hub`, but will no longer run against a clean DB, and won't be using galaxykit for data setup. The expectation is that a test creates a unique thing, tests any relevant actions, and deletes it. There are helpers to find the thing by filtering for it, there is also a cronjob that regularly removes old test data.

There is no dependabot, updates are done through a periodic `npm run upgrade` github action, using https://www.npmjs.com/package/npm-check-updates.

---

rebase: `git fetch ; git rebase origin/main`

prettier: `npm run prettier:fix` (not just prettier)
