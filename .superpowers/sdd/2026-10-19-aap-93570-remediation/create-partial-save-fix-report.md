# AAP-93570 create partial-save fix report

## Change

After a new workflow node is successfully created, reconcile its in-memory
`launch_data.original` snapshot from the POST response before processing later
resource associations and workflow edges. The snapshot records persisted
`extra_data` and the workflow template ID, using the create payload as a
fallback when the response omits a field. This preserves the server state if a
later association fails and the node is reopened before a template swap.

The snapshot reconciliation helper now accepts a cohesive options object,
removing the new `max-params` lint warning without changing behavior.

The regression test covers create with non-empty variables, a failed later
success-edge association, reopening with empty variables, and the subsequent
template swap. It verifies that the compatibility `extra_data: {}` PATCH is
sent before the template PATCH.

## Validation

All commands were run from `/Users/cferman/Projects/ansible-ui`.

| Check | Result |
| --- | --- |
| `npx vitest run frontend/awx/resources/templates/WorkflowVisualizer/hooks/useSaveVisualizer.test.ts frontend/awx/resources/templates/WorkflowVisualizer/hooks/useGetInitialValues.test.ts frontend/awx/resources/templates/WorkflowVisualizer/wizard/NodeEditWizard.component.test.tsx` | PASS — 3 files, 84 tests |
| `npx nx run @ansible/awx-ui:tsc` | PASS |
| `npx eslint --max-warnings=0 frontend/awx/resources/templates/WorkflowVisualizer/hooks/useSaveVisualizer.tsx frontend/awx/resources/templates/WorkflowVisualizer/hooks/useSaveVisualizer.test.ts` | PASS |
| `npx prettier --check frontend/awx/resources/templates/WorkflowVisualizer/hooks/useSaveVisualizer.tsx frontend/awx/resources/templates/WorkflowVisualizer/hooks/useSaveVisualizer.test.ts` | PASS |
| `git diff --check` | PASS |

## Limitations

- The repository-wide `npm test` suite was not run for this focused fix.
- Live browser validation against an AAP instance was not available in this worktree.
