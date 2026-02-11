# Test Migration Specifications

This directory contains structured specifications for migrating Cypress tests to Playwright. These specs are designed to be consumed by AI agents (Claude) or developers to ensure consistent, accurate migrations.

## Directory Structure

```
migration-specs/
├── README.md                          # This file
├── templates/
│   └── migration-spec-template.yaml   # Template for creating new specs
├── eda/
│   ├── roles.yaml                     # EDA Roles migration spec
│   ├── credentials.yaml               # (upcoming)
│   └── ...
├── hub/
│   └── ...
└── awx/
    └── ...
```

## Using Migration Specs with Claude

### Quick Start

1. **Create a spec** using the template in `templates/migration-spec-template.yaml`
2. **Invoke Claude** with the spec:
   ```bash
   /migrate-test --spec migration-specs/eda/roles.yaml
   ```

3. **Claude will**:
   - Read the spec
   - Understand the context (resources, utilities, API endpoints)
   - Migrate tests using verified patterns
   - Run and verify tests pass
   - Create a commit

### Spec Format

Each spec is a YAML file with:

```yaml
meta:
  service: eda|hub|awx|platform
  category: roles|credentials|inventories|etc
  priority: high|medium|low
  estimated_tests: number

tests:
  - source: path/to/cypress/test.cy.ts
    target: path/to/playwright/test.spec.ts
    test_cases:
      - name: "test case name from Cypress"
        complexity: simple|medium|complex

resources:
  - resource_name: API endpoint pattern

utilities:
  available: [list of Playwright utilities]
  needed: [list of utilities to create]

notes: Additional context, gotchas, special considerations
```

## Creating a New Migration Spec

### 1. Copy the Template

```bash
cp migration-specs/templates/migration-spec-template.yaml migration-specs/eda/my-feature.yaml
```

### 2. Fill in Meta Information

```yaml
meta:
  service: eda
  category: my-feature
  priority: high
  jira_ticket: AAP-12345  # Optional
  estimated_tests: 8
```

### 3. List Tests to Migrate

For each Cypress file, specify:
- **source**: Cypress file path
- **target**: Playwright file path (follow convention)
- **test_cases**: List each `it()` block with complexity estimate

```yaml
tests:
  - source: cypress/e2e/eda/my-feature/feature-crud.cy.ts
    target: playwright/tests/integration/automation-decisions/my-feature/feature-crud.spec.ts
    test_cases:
      - name: "can create a feature"
        complexity: medium
      - name: "can edit a feature"
        complexity: simple
      - name: "can delete a feature"
        complexity: simple
```

### 4. Document Resources & APIs

List all resources and their API patterns:

```yaml
resources:
  - MyFeature: /api/eda/v1/my-features/
  - EdaCredential: /api/eda/v1/eda-credentials/
  - Organization: /api/gateway/v1/organizations/
```

### 5. Identify Utilities

Check `playwright/utils/` and `playwright/commands/` for existing utilities:

```yaml
utilities:
  available:
    - clickTableRow
    - getTableRow
    - navigateTo
    - EdaCredential.api.create
    - EdaCredential.api.delete
  needed:
    - MyFeature.api.create
    - MyFeature.api.delete
    - MyFeature.ui.create
```

### 6. Add Important Notes

Include any gotchas, special selectors, or workflow quirks:

```yaml
notes: |
  - Features require an EDA credential before creation
  - The "status" field is auto-populated after save
  - Use data-testid="feature-name" for name field (no data-cy exists)
  - Delete confirmation requires typing the feature name
```

## Benefits of Using Specs

### For AI Agents (Claude)
- **Pre-validated context**: All resources, utilities, and APIs documented upfront
- **Reduced errors**: Known patterns and gotchas documented
- **Faster execution**: No need to explore and discover utilities
- **Consistency**: Same format across all migrations

### For Developers
- **Clear scope**: Know exactly what needs migration
- **Reusable patterns**: Learn from existing specs
- **Progress tracking**: Check off migrated tests
- **Knowledge sharing**: Team learns API patterns and utilities

## Workflow

### Standard Migration Process

1. **Create Spec** (Developer or AI)
   ```bash
   # Analyze Cypress tests
   npm run analyze-test cypress/e2e/eda/my-feature/*.cy.ts
   # Generates: migration-specs/eda/my-feature.yaml
   ```

2. **Review Spec** (Developer)
   - Verify test counts
   - Confirm utility availability
   - Add notes about special cases

3. **Execute Migration** (Claude)
   ```bash
   /migrate-test --spec migration-specs/eda/my-feature.yaml
   ```

4. **Verify & Commit** (Claude)
   - All tests pass
   - No linting/TS errors
   - Single commit with all migrations

5. **Create PR** (Developer)
   - Link to Jira ticket
   - Reference spec file
   - Include test results

## Advanced: Batch Processing

Create a batch spec for related tests:

```yaml
meta:
  batch_name: "EDA Credentials Suite"
  jira_epic: AAP-12000
  priority: high

batches:
  - ticket: AAP-12001
    spec: migration-specs/eda/credential-types.yaml
  - ticket: AAP-12002
    spec: migration-specs/eda/external-credentials.yaml
  - ticket: AAP-12003
    spec: migration-specs/eda/credential-access.yaml
```

Then run:
```bash
/migrate-batch migration-specs/eda/credentials-batch.yaml
```

## Tips for Success

### DO:
- ✅ Check existing Playwright tests for patterns before creating spec
- ✅ Grep for utilities: `grep -r "EdaCredential" playwright/utils/`
- ✅ Use exact Cypress test names in test_cases
- ✅ Document API payload quirks in notes
- ✅ Mark utilities as "needed" if they don't exist yet

### DON'T:
- ❌ Create specs for cleanup/utility test files
- ❌ Skip the notes section - it's crucial for complex tests
- ❌ Forget to check if utilities already exist
- ❌ Mix multiple unrelated features in one spec

## Examples

See `migration-specs/eda/roles.yaml` for a complete working example.

## Questions?

- Check existing specs in this directory for patterns
- Review `/migrate-test` skill in `.claude/commands/migrate-test.md`
- Ask in #aap-ui-testing Slack channel
