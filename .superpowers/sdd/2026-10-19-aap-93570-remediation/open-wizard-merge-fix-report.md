# AAP-93570 open-wizard merge fix

## Scope

Fixed the three final-review findings in `NodeEditWizard` without changing the
earlier AAP-93570 work:

- Reconciled snapshots now contribute only `extra_data` and `template_id`.
  Freshly fetched `credentials`, `instance_groups`, and `labels` remain the
  current wizard values.
- `isTemplateChange` is removed when the reconciled original template ID
  matches the node's current template ID, so an unchanged template cannot
  trigger a standalone empty `extra_data` clear.
- Submit-data construction was extracted from `NodeEditWizard` to keep the
  component below the 200-line guardrail. The snapshot merge itself lives in
  `mergeNodeOriginalResources.ts`.

## Regression coverage

Added focused coverage for:

- preserving freshly fetched associations while applying reconciled persisted
  fields;
- dropping an obsolete `isTemplateChange` flag when the node is already on the
  original template.

## Validation

| Check | Result |
| --- | --- |
| Focused Visualizer tests: `useSaveVisualizer`, `useGetInitialValues`, `NodeEditWizard.component`, `NodeEditWizard`, `buildEffectivePrompt` | PASS — 5 files, 127 tests |
| Full Workflow Visualizer suite | PASS — 52 files, 709 tests |
| AWX TypeScript check | PASS — `npm --prefix frontend/awx run tsc` |
| Scoped ESLint | PASS |
| Prettier check | PASS |
| `git diff --check` | PASS |
| Scoped production guardrail scan | PASS — no warnings in modified production files |

The guardrail configuration ignores the modified component test file; it emits
only the expected ignored-file warning when that file is included explicitly.

Repository-wide `npm test` and live AAP/browser reproduction were not run in
this local environment.

