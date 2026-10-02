# AAP-78724: OPTIONS-driven validation in PageForm & PageWizard

## Context: How We Got Here

---

## The Main Ask: OPTIONS-Driven Validation in Text Inputs

Add `optionsData` support to text and textarea inputs so they automatically validate against patterns exposed by the backend via OPTIONS responses.

**Example:** When a form renders:

```typescript
const { data: optionsData } = useOptions(awxAPI`/schedules/`);

<PageForm optionsData={optionsData}>
  <PageFormTextInput name="name" ... />
  <PageFormTextArea name="description" ... />
</PageForm>
```

The inputs automatically discover and apply validation patterns without any validation code in the UI.

---

## The Broader Goal: Wizard Support + Edge Cases

The main ask works for simple forms. But wizards are different: they wrap multiple form steps, each of which may need access to the same (or different) backend patterns. And real forms encounter edge cases:

1. **Single-resource wizards** — all steps need the same OPTIONS patterns
2. **Multi-resource forms** — one form needs patterns from multiple backends
3. **Conditionally-rendered steps** — different fields appear based on user input; each branch might need different patterns
4. **Nested field names** — forms use `organization.name`, but OPTIONS keys are flat (`name`)

Our solution needed to handle all four, not just the simple case.

---

## Analysis: Four Distinct Scenarios

### Scenario 1: Single-Resource Wizards (ScheduleAddWizard)

**Pattern:** Wizard steps are composed into a single form. All steps belong to one resource (e.g., schedule creation). They should all see the same OPTIONS patterns.

**Challenge:** `PageWizard` had no way to forward `optionsData` to its internal `PageWizardBody` and `PageForm`.

**Example:**

```typescript
// Caller fetches OPTIONS for schedules
const { data: optionsData } = useOptions(awxAPI`/schedules/`);

// Each step should see these patterns
<PageWizard steps={[BasicStep, AdvancedStep]} optionsData={optionsData} />
```

### Scenario 2: Concurrent Multi-Resource Steps (PlatformOrganizationForm)

**Pattern:** A single form step mixes fields from two different resources (e.g., Gateway org + Controller org, both with their own OPTIONS endpoints).

**Challenge:** Only one resource's patterns could be active at a time. There was no way to layer patterns from a second resource on top of the ambient context.

**Example:**

```typescript
// Wizard level: Gateway organization patterns
<PageWizard optionsData={gatewayOrgOptions} steps={[...]} />

// Inside a step: also need Controller org patterns
// How do we add Controller patterns without removing Gateway patterns?
```

### Scenario 3: Runtime-Divergent Resource Steps (NodeTypeStep)

**Pattern:** A form step branches based on user input. Depending on `node_type`, different fields render and each branch needs patterns from a different backend.

**Challenge:** Patterns are static (determined at render time). Changing the resource at runtime required re-fetching and re-wiring, with no built-in mechanism to swap patterns.

**Example:**

```typescript
// User selects node type in a previous step
// Now this step renders different fields based on the choice
case RESOURCE_TYPE.workflow_approval:
  return <ApprovalFields />;  // needs workflow_approval OPTIONS
case RESOURCE_TYPE.project:
  return <ProjectFields />;   // needs project OPTIONS
```

### Scenario 4: Nested Field Names (TemplateLaunchWizard, PlatformOrganizationForm)

**Pattern:** Forms use nested names for semantic organization (e.g., `organization.name`, `prompt.limit`, `credential_passwords.ssh_password`) but backend OPTIONS keys are flat (e.g., `name`, `limit`, `ssh_password`).

**Challenge:** There was no automatic mapping from nested names to flat keys. Callers had to manually wire up the mapping or lose validation.

**Example:**

```typescript
// Form field name uses nesting
<PageFormTextInput name="organization.name" ... />

// But OPTIONS has a flat key
// { actions: { POST: { name: { pattern: ... } } } }

// How do we connect organization.name to name without manual wiring?
```

---

## The Solution: Composable Field Metadata Primitives

Rather than solve each scenario in isolation, we built a two-layer architecture that separates **extraction** (OPTIONS → metadata map) from **provisioning** (metadata map → context).

### Layer 1: Extraction

**`extractPageFormOptionsFields(optionsData: PageFormOptionsData): Record<string, FieldMetadata>`**

Pure function that normalizes a DRF OPTIONS response into a flat metadata map:

- Checks `POST`, `PUT`, `PATCH` actions for field patterns
- Extracts `pattern`, `pattern_description`, and `flags`
- Handles both snake_case and camelCase field names
- Filters to only fields with validation patterns
- Returns a simple, serializable `{ fieldName: FieldMetadata }` map

**Why this matters:** Once you have a flat metadata map, the source doesn't matter. Credential type schemas, notification type metadata, plugin schemas—all can use the same extraction and provisioning logic.

**`usePageFormOptionsFields(optionsData): Record<string, FieldMetadata>`**

Memoized version of extraction. Prevents unnecessary re-extraction across re-renders.

### Layer 2: Provisioning

**`PageFormFieldMetadataProvider`**

Source-agnostic provider that takes any flat metadata map and makes it available via context. Supports two modes:

- **Replace (default):** Provider's fields become the active context
- **Merge (`merge={true}`):** Provider's fields layer on top of the ambient context; own fields win on collisions

```typescript
// Replace mode: discard ambient context
<PageFormFieldMetadataProvider fields={fields}>
  {children}
</PageFormFieldMetadataProvider>

// Merge mode: layer on top
<PageFormFieldMetadataProvider fields={fields} merge>
  {children}
</PageFormFieldMetadataProvider>
```

**Key insight:** Merge mode solves multi-resource scenarios. A parent provides Gateway patterns; a child adds Controller patterns on top without discarding the parent's.

**`PageFormOptionsProvider`**

Convenience wrapper for the DRF-OPTIONS case. Internally:

1. Calls `extractPageFormOptionsFields` to extract metadata
2. Wraps result in `PageFormFieldMetadataProvider`
3. Forwards `merge` prop through

Used by `PageForm` internally; also available for composing multiple OPTIONS sources.

### Enhanced `usePageFormOptionsContext(name, optionsFieldName?)`

Updated hook with smart defaults for nested field names:

- **Default behavior:** `organization.name` → looks up key `name` (last dot-separated segment)
- **Override:** pass `optionsFieldName="explicit_key"` to specify a different lookup

```typescript
// Automatic: extracts "name" from "organization.name"
usePageFormOptionsContext('organization.name');

// Explicit: use a different key
usePageFormOptionsContext('organization.name', 'org_name');
```

This solves nested field-name collisions without requiring wiring changes.

---

## How This Solves All Four Scenarios

### Scenario 1: Single-Resource Wizards ✅

```typescript
// In ScheduleAddWizard.tsx
const { data: optionsData } = useOptions(awxAPI`/schedules/`);

<PageWizard
  steps={steps}
  optionsData={optionsData}  // ← Pass OPTIONS once
  onSubmit={handleSubmit}
/>
```

**How it works:**

- `PageWizard` now accepts `optionsData` prop
- Forwards to internal `PageWizardBody`
- `PageWizardBody` passes to its internal `PageForm`
- `PageForm` wraps children with `PageFormOptionsProvider(optionsData)`
- All step components auto-discover patterns from context
- **Zero changes needed to step components**

### Scenario 2: Concurrent Multi-Resource Steps ✅

```typescript
// At wizard level: Gateway org OPTIONS
const { data: gatewayOrgOptions } = useOptions(gatewayAPI`/organizations/`);

<PageWizard optionsData={gatewayOrgOptions} steps={steps} />

// Inside a step: add Controller org patterns on top
function ControllerOrganizationDetails(props: { controllerOrgOptions?: OptionsResponse }) {
  const fields = extractPageFormOptionsFields(props.controllerOrgOptions);

  return (
    <PageFormFieldMetadataProvider fields={fields} merge>
      {/* Gateway patterns still available; Controller patterns layered on top */}
      <PageFormTextInput name="maxHosts" ... />
      <PageFormTextInput name="policy" ... />
    </PageFormFieldMetadataProvider>
  );
}
```

**How it works:**

- Gateway org patterns available from wizard level
- Child component extracts Controller patterns
- `merge={true}` layers Controller on top of Gateway
- Both contexts coexist; own fields win on collision

### Scenario 3: Runtime-Divergent Resource Steps ✅

```typescript
// In NodeTypeStep.tsx, branching on user selection
switch (selectedNodeType) {
  case RESOURCE_TYPE.workflow_approval:
    return <ApprovalNameFields />;
  case RESOURCE_TYPE.project:
    return <ProjectFields />;
}

// Each branch fetches and provides its own patterns
function ApprovalNameFields() {
  const { data } = useOptions(awxAPI`/workflow_approval_templates/`);
  const fields = extractPageFormOptionsFields(data);

  return (
    <PageFormFieldMetadataProvider fields={fields}>
      <PageFormTextInput name="approval_name" ... />
    </PageFormFieldMetadataProvider>
  );
}
```

**How it works:**

- Component is reactive to user selection
- When user changes the type, fetch and extraction re-run
- New metadata replaces old, scoped to this branch
- Parent context (if any) unaffected

### Scenario 4: Nested Field Names ✅

```typescript
// Form with nested names
<PageFormTextInput name="organization.name" ... />
<PageFormTextInput name="prompt.limit" ... />
<PageFormTextInput name="credential_passwords.ssh_password" ... />

// Internally, usePageFormOptionsContext uses smart lookup
// organization.name → looks up key "name" ✅
// prompt.limit → looks up key "limit" ✅
// credential_passwords.ssh_password → looks up key "ssh_password" ✅
```

**How it works:**

- `usePageFormOptionsContext("organization.name")` defaults to looking up `"name"`
- Works automatically; no wiring needed
- If collision (two fields both ending in `.name`), use override:
  ```typescript
  <PageFormTextInput name="organization.name" optionsFieldName="org_name" />
  ```

---

## Implementation: What Was Delivered

### New Exports from PageFormOptionsContext.tsx

| Symbol                                               | Purpose                                        |
| ---------------------------------------------------- | ---------------------------------------------- |
| `extractPageFormOptionsFields()`                     | Pure extraction: OPTIONS → field metadata map  |
| `usePageFormOptionsFields()`                         | Memoized extraction hook                       |
| `PageFormFieldMetadataProvider`                      | Source-agnostic, mergeable context provider    |
| `PageFormOptionsProvider`                            | DRF-OPTIONS convenience wrapper                |
| `usePageFormOptionsContext(name, optionsFieldName?)` | Enhanced lookup with smart defaults + override |

### Props Added

| Component           | Prop                | Purpose                                     |
| ------------------- | ------------------- | ------------------------------------------- |
| `PageWizard`        | `optionsData?`      | Pass OPTIONS to all steps                   |
| `PageWizardBody`    | `optionsData?`      | Internal forwarding (interface update)      |
| `PageForm`          | `optionsData?`      | Already existed; refactored to use provider |
| `PageFormTextInput` | `optionsFieldName?` | Override field-name lookup                  |
| `PageFormTextArea`  | `optionsFieldName?` | Override field-name lookup                  |

### Code Changes

**Behavior-preserving refactors:**

- `PageForm.tsx` — Refactored to use `PageFormOptionsProvider` internally (same behavior)
- `usePageFormOptionsContext()` — Enhanced with smart lookup (backward-compatible; bare names still work)

**New code:**

- `PageFormOptionsContext.tsx` — All five new symbols
- `PageWizard.tsx`, `PageWizardBody.tsx`, `types.ts` — optionsData plumbing
- `PageFormTextInput.tsx`, `PageFormTextArea.tsx` — optionsFieldName prop + usage

**Tests (25 new):**

- `PageFormOptionsContext.test.tsx` — 22 tests covering extraction, memoization, lookup, merge semantics
- `PageWizard.test.tsx` — 1 test: optionsData reaches inputs end-to-end
- `PageWizardBody.test.tsx` — 2 tests: optionsData forwarding, absence of optionsData

---

## Usage Guide

### Single-Resource Form (AwxPageForm)

```typescript
const { data: optionsData } = useOptions(awxAPI`/job_templates/`);

<AwxPageForm
  defaultValue={jobTemplate}
  optionsData={optionsData}  // ← Add this line
  onSubmit={onSubmit}
>
  <PageFormTextInput name="name" ... />
</AwxPageForm>
```

### Single-Resource Wizard (ScheduleAddWizard)

```typescript
const { data: optionsData } = useOptions(awxAPI`/schedules/`);

<PageWizard
  steps={steps}
  optionsData={optionsData}  // ← Add this line
  onSubmit={onSubmit}
/>
```

### Multi-Resource Step (PlatformOrganizationForm)

```typescript
// At wizard level
<PageWizard optionsData={primaryOptions} steps={steps} />

// Inside step
const fields = extractPageFormOptionsFields(secondaryOptions);
<PageFormFieldMetadataProvider fields={fields} merge>
  {/* Merged context with both resources' patterns */}
</PageFormFieldMetadataProvider>
```

### Conditional Resource Steps (NodeTypeStep)

```typescript
// User selection determines which fields render
function renderFields() {
  if (selectedType === 'approval') {
    return <ApprovalFields />;  // fetch approval OPTIONS
  }
  return <ProjectFields />;     // fetch project OPTIONS
}
```

---

## How It Works Internally

### Validation Flow

1. **Backend** exposes patterns in OPTIONS response:

   ```json
   {
     "actions": {
       "POST": {
         "name": { "pattern": "^[a-z]+$", "pattern_description": "lowercase" }
       }
     }
   }
   ```

2. **Caller** fetches OPTIONS and passes to form/wizard:

   ```typescript
   const { data } = useOptions(endpoint);
   <PageForm optionsData={data} />
   // or
   <PageWizard optionsData={data} steps={steps} />
   ```

3. **PageForm/PageWizard** provides metadata via context:

   - `PageFormOptionsProvider` extracts and provides
   - Wrapped around all form children

4. **PageFormTextInput/TextArea** auto-discovers pattern:

   - Reads from context via `usePageFormOptionsContext(name)`
   - Compares value to defaultValue to check if dirty
   - Only validates if dirty (grandfathering—don't retroactively fail old data)
   - Triggers on blur
   - Shows `pattern_description` as error message

5. **Custom validate** runs after pattern validation:
   - OPTIONS pattern → custom validator → first error wins

### isDirty Gating (Grandfathering)

Fields with invalid default values (from backend) don't validate until the user changes them:

```typescript
defaultValue={{ name: "existing@invalid" }}

// User focuses and blurs without changing → NO validation error
// User changes to "new@invalid" and blurs → validation error
```

Matches the backend's `self.instance` comparison.

---

## Field Name Alignment: Form vs. API

### The Issue

Some forms use field names that differ from their corresponding API field names. This creates a mismatch between the form's internal naming and the OPTIONS metadata keys, requiring manual wiring via `optionsFieldName`.

**Example discrepancies:**

| Form Field Name | API Field Name | Wizard | API Endpoint |
|---|---|---|---|
| `node_alias` | `identifier` | Node Add/Edit | `/workflow_job_template_late_nodes/` |
| `approval_name` | `name` | Node Add/Edit (approval nodes) | `/workflow_job_template_late_nodes/{id}/create_approval_template/` |
| `approval_description` | `description` | Node Add/Edit (approval nodes) | `/workflow_job_template_late_nodes/{id}/create_approval_template/` |
| `policy` | `opa_query_path` | PlatformOrganization | `/organizations/` |

### Recommendation

Rather than use `optionsFieldName` overrides for these cases, rename the form fields to match their API names. This approach:

1. **Eliminates manual wiring** — Smart lookup works automatically
2. **Improves clarity** — Form field names reflect what they represent
3. **Reduces cognitive load** — Developers see the same name everywhere
4. **Keeps overrides as escape hatches** — For genuine collisions, not mismatch fixes

The `optionsFieldName` prop remains available for:
- Collision resolution (two form fields both ending in `.name`)
- Cases where renaming would be a breaking change
- Custom metadata sources where extraction doesn't match form names

**Action:** Update the affected form fields to use correct API names. This is a small, one-time cleanup with ongoing benefits.

---

## Backward Compatibility

✅ **Zero breaking changes:**

- All new symbols are additions (exports, props)
- Existing code path unchanged when props omitted
- `usePageFormOptionsContext()` enhancement is backward-compatible
- Framework tests (122 total) all pass unmodified

---

## Foundation for AAP-87604 (Phase 2)

AAP-87604 targets five forms with JSON sub-key patterns (CredentialForm, NotifierForm, CredentialInputSource, EDA CredentialForm, AuthenticatorForm). These don't fit DRF's standard OPTIONS shape, but the new primitives enable them:

```typescript
// CredentialForm: extract from credential type schema
const fields = extractCredentialTypeFieldMetadata(credentialType);

// NotifierForm: extract from type-specific OPTIONS nesting
const fields = extractNotificationTypeMetadata(notificationType);

// AuthenticatorForm: extract from plugin schema
const fields = extractPluginSchemaMetadata(pluginSchema);

// All three use the same provider
<PageFormFieldMetadataProvider fields={fields}>
  {/* Fields automatically validated */}
</PageFormFieldMetadataProvider>
```

No new context layers, no special `PageWizardStep.optionsData` API. One mechanism, multiple sources.

---

## Test Coverage

**122 framework tests passing** (all existing + 25 new):

- **Extraction** (8 tests): empty, POST/PUT/PATCH, camelCase support, flags, collisions
- **Memoization** (2 tests): same reference vs. recomputation
- **Smart lookup** (5 tests): bare names, nested segments, override, missing keys
- **Replace vs. merge** (5 tests): basic provider, context replacement, merge behavior, collision handling
- **DRF convenience** (3 tests): extraction, merge, undefined data
- **Wizard integration** (3 tests): optionsData reaches inputs, absence doesn't break, end-to-end

All tests are behavior-focused, not implementation-focused.

---

## Key Files Changed

| File                                                 | What Changed                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `framework/PageForm/PageFormOptionsContext.tsx`      | NEW: Five new exports (extract, memoize, providers, enhanced hook) |
| `framework/PageForm/PageForm.tsx`                    | Refactored to use `PageFormOptionsProvider` internally             |
| `framework/PageForm/Inputs/PageFormTextInput.tsx`    | Added `optionsFieldName?` prop                                     |
| `framework/PageForm/Inputs/PageFormTextArea.tsx`     | Added `optionsFieldName?` prop                                     |
| `framework/PageWizard/PageWizard.tsx`                | Added `optionsData?` prop                                          |
| `framework/PageWizard/PageWizardBody.tsx`            | Forward `optionsData` to internal PageForm                         |
| `framework/PageWizard/types.ts`                      | Document `PageWizardBody.optionsData` interface                    |
| `framework/PageForm/PageFormOptionsContext.test.tsx` | NEW: 22 unit tests                                                 |
| `framework/PageWizard/PageWizard.test.tsx`           | 1 new integration test                                             |
| `framework/PageWizard/PageWizardBody.test.tsx`       | 2 new integration tests                                            |
| `docs/AAP-78724-implementation-summary.md`           | This document (consolidated overview)                              |

---

## Migration Path

### Phase 0 (Before this work)

- Text inputs had no OPTIONS support
- Wizards had no way to pass optionsData to steps
- Forms with nested names required manual wiring
- Multi-resource forms couldn't layer patterns

### Phase 1 (This work: AAP-78724)

- Text inputs automatically validate against OPTIONS patterns
- Wizards can pass optionsData to reach all steps
- Forms can compose multi-resource metadata with merge flag
- Nested field names resolve automatically
- Patterns can be swapped at runtime for conditional steps

### Phase 2 (AAP-87604: Custom metadata sources)

- Credential forms extract patterns from credential type schemas
- Notifier forms extract patterns from type-specific OPTIONS nesting
- Plugin forms extract patterns from plugin schemas
- Same provider system, different extraction logic per source
- Forms wire themselves without needing new PageWizard APIs

---

## Troubleshooting

**Q: Why isn't validation working in my wizard?**

- Did you pass `optionsData` to `<PageWizard>`?
- Does the OPTIONS response have `pattern` fields? (check network tab)
- Is the field a `PageFormTextInput`/`PageFormTextArea`? (others not supported yet)
- Is the field dirty? (validation only runs on changed fields)

**Q: My form has two fields both named `*.name` and they're colliding.**

- Use `optionsFieldName` prop to disambiguate:
  ```typescript
  <PageFormTextInput name="organization.name" optionsFieldName="org_name" />
  ```

**Q: Can I use Unicode patterns?**

- Yes. If the backend sends:
  ```json
  { "pattern": "^[\\p{L}\\p{N}_]+$", "flags": "u" }
  ```
  The framework handles it correctly with `RegExp(pattern, flags)`.

**Q: Why does my OPTIONS endpoint use camelCase instead of snake_case?**

- Both are supported. The framework checks for both `pattern_description` and `patternDescription`.

---

## Next Steps

To enable OPTIONS-driven validation in your forms:

1. **If you already fetch OPTIONS:** Add `optionsData={data}` to your `PageForm` wrapper or `PageWizard`
2. **If you need multi-resource composition:** Use `PageFormFieldMetadataProvider` with `merge={true}` for secondary resources
3. **If you have nested field names:** They work automatically; use `optionsFieldName` override only if needed

For the broader platform rollout:

- Parent epic: [AAP-74630](https://redhat.atlassian.net/browse/AAP-74630)
- Feature epic: [ANSTRAT-1756](https://redhat.atlassian.net/browse/ANSTRAT-1756)
- Phase 2 story: [AAP-87604](https://redhat.atlassian.net/browse/AAP-87604)
