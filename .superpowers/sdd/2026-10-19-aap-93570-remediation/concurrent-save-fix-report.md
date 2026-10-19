# AAP-93570 concurrent-save reconciliation fix

## Change

Updated `useSaveVisualizer` reconciliation so a completed workflow-node POST/PATCH reads the node's current graph data at reconciliation time. It now merges only the persisted snapshot fields (`launch_data.original.extra_data` and `launch_data.original.template_id`) while preserving the current resource, launch data, and any edits made while the request was in flight.

Added a delayed-PATCH regression test that edits the node before the response resolves and verifies that the newer resource and launch values survive alongside the refreshed persisted snapshot.

## Validation

- Focused save-hook tests: **43/43 passed**
- AWX WorkflowVisualizer scope: **705 passed, 1 unrelated timeout** in `NodeAddWizard.integration.test.tsx` under the local Node 26 runtime; the changed save-hook tests passed.
- AWX TypeScript check: **passed** (`npx nx run @ansible/awx-ui:tsc`)
- Scoped ESLint: **passed** with no errors
- Prettier check: **passed**
- `git diff --check`: **passed**

The repository-wide test suite and live AAP reproduction were not run as part of this focused fix. PatternFly, Playwright, and Chrome DevTools MCPs were not available; this change does not add or alter UI components or browser workflows.
