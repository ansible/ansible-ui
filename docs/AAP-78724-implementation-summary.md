# AAP-78724: OPTIONS-driven validation context in PageForm

## Summary

This feature implements an OPTIONS-driven validation mechanism that allows form text inputs to automatically discover and apply validation patterns from backend OPTIONS responses. The UI maintains zero validation logic - all patterns come from the backend.

## What was delivered

### 1. **PageFormOptionsContext** (NEW)
- File: `framework/PageForm/PageFormOptionsContext.tsx`
- React context for storing OPTIONS field metadata
- Hook `usePageFormOptionsContext(fieldName)` for field-level access
- Interface `FieldMetadata` with `pattern` and `pattern_description`

### 2. **PageForm optionsData prop**
- File: `framework/PageForm/PageForm.tsx`
- New optional `optionsData` prop accepts OPTIONS response
- Extracts field metadata from `actions.POST`, `actions.PUT`, and `actions.PATCH`
- Provides metadata via `PageFormOptionsContext.Provider`

### 3. **Auto-discovery in PageFormTextInput**
- File: `framework/PageForm/Inputs/PageFormTextInput.tsx`
- Reads pattern from context by field `name`
- Applies validation only when field is dirty (grandfathering)
- Custom onBlur handler triggers validation when pattern exists

### 4. **Auto-discovery in PageFormTextArea**
- File: `framework/PageForm/Inputs/PageFormTextArea.tsx`
- Same auto-discovery logic as PageFormTextInput
- Consistent isDirty gating
- onBlur validation triggering

### 5. **ActionsResponse type extension**
- File: `frontend/awx/interfaces/OptionsResponse.ts`
- Added `pattern?: string`
- Added `pattern_description?: string`

### 6. **Unit tests**
- File: `framework/PageForm/PageFormOptionsContext.test.tsx`
- Comprehensive test coverage (8 tests)
- Tests pattern validation on dirty fields
- Tests grandfathering (skipping validation on clean fields)
- Tests backward compatibility (no optionsData)
- Tests onBlur triggering
- Tests validation ordering (OPTIONS pattern → custom validate)
- Tests POST, PUT, and PATCH action support

## Usage Example

### Complete walkthrough: Creating a Job Template

#### Step 1: Backend returns OPTIONS response

When the UI calls `OPTIONS /api/v2/job_templates/`, the backend returns:

```json
{
  "name": "Job Template List",
  "description": "# List Job Templates...",
  "actions": {
    "POST": {
      "name": {
        "type": "string",
        "required": true,
        "label": "Name",
        "max_length": 512,
        "help_text": "Name of this job template.",
        "pattern": "^[a-zA-Z0-9_][a-zA-Z0-9_ -]*$",
        "pattern_description": "Name may only contain letters, numbers, underscores, hyphens, and spaces, and cannot begin with a hyphen or space"
      },
      "description": {
        "type": "string",
        "required": false,
        "label": "Description",
        "help_text": "Optional description of this job template."
      },
      "job_type": {
        "type": "choice",
        "required": true,
        "choices": [["run", "Run"], ["check", "Check"]]
      }
    }
  }
}
```

**Key points:**
- `name` field has `pattern` and `pattern_description` ✅
- `description` field has NO pattern (optional free-text)
- `job_type` is a choice field (not validated by pattern)

#### Step 2: Frontend fetches OPTIONS and passes to form

```typescript
// In CreateJobTemplate.tsx or EditJobTemplate.tsx

import { useOptions } from '../common/crud/useOptions';
import { AwxPageForm } from '../common/AwxPageForm';
import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { JobTemplate } from '../interfaces/JobTemplate';

export function CreateJobTemplate() {
  const navigate = useNavigate();
  
  // 1. Fetch OPTIONS data (you might already be doing this!)
  const { data: optionsData } = useOptions<OptionsResponse>(
    '/api/v2/job_templates/'
  );
  
  // 2. Handle form submission
  const onSubmit = async (data: JobTemplate) => {
    const response = await postRequest('/api/v2/job_templates/', data);
    navigate(`/templates/job-template/${response.id}`);
  };

  return (
    <PageLayout>
      <PageHeader title="Create Job Template" />
      <AwxPageForm
        submitText="Create job template"
        onSubmit={onSubmit}
        onCancel={() => navigate('/templates')}
        defaultValue={{}}
        optionsData={optionsData}  // 👈 Pass OPTIONS data here!
      >
        {/* Name field - HAS pattern from OPTIONS */}
        <PageFormTextInput
          name="name"
          label="Name"
          placeholder="Enter name"
          isRequired
        />
        
        {/* Description field - NO pattern from OPTIONS */}
        <PageFormTextInput
          name="description"
          label="Description"
          placeholder="Enter description (optional)"
        />
        
        {/* Job type - not a text input, pattern doesn't apply */}
        <PageFormSelect
          name="job_type"
          label="Job type"
          options={[
            { label: 'Run', value: 'run' },
            { label: 'Check', value: 'check' },
          ]}
          isRequired
        />
      </AwxPageForm>
    </PageLayout>
  );
}
```

**That's it!** No validation code needed. The framework handles everything.

#### Step 3: User interaction scenarios

##### Scenario A: Valid input (Create form)
```
1. User types: "My Production Template"
2. User blurs field (clicks away)
3. ✅ No error - matches pattern ^[a-zA-Z0-9_][a-zA-Z0-9_ -]*$
4. Form can be submitted
```

##### Scenario B: Invalid input (Create form)
```
1. User types: "-Invalid Name"  (starts with hyphen)
2. User blurs field
3. ❌ Error appears: "Name may only contain letters, numbers, underscores, 
   hyphens, and spaces, and cannot begin with a hyphen or space"
4. Form cannot be submitted until fixed
```

##### Scenario C: Invalid input (Edit form - grandfathering)
```
Initial state:
  defaultValue={{ name: "-OldInvalidName", ... }}  // Existing from backend
  
1. User opens edit form
2. Field shows: "-OldInvalidName"
3. User focuses field, then blurs WITHOUT changing
4. ✅ No error - field is NOT dirty, grandfathering applies
5. User can save form as-is

But if user changes it:
6. User types: "-NewInvalidName"
7. User blurs field
8. ❌ Error appears - field IS dirty, validation runs
```

##### Scenario D: Description field (no pattern)
```
1. User types: "@#$%^&*()!!! Any characters work here!!!"
2. User blurs field
3. ✅ No error - description has no pattern in OPTIONS
4. Validation delegated to backend (if backend wants to validate)
```

#### Step 4: What the UI renders

**Before blur (typing "bad!name"):**
```
┌─────────────────────────────────────┐
│ Name *                              │
│ ┌─────────────────────────────────┐ │
│ │ bad!name                        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**After blur (validation triggered):**
```
┌─────────────────────────────────────┐
│ Name *                              │
│ ┌─────────────────────────────────┐ │
│ │ bad!name                        │ │ ← Red border
│ └─────────────────────────────────┘ │
│ ⚠️ Name may only contain letters,   │
│    numbers, underscores, hyphens,   │
│    and spaces, and cannot begin     │
│    with a hyphen or space           │
└─────────────────────────────────────┘
```

### Real-world integration points

#### A. In workspace-specific PageForm wrappers

```typescript
// frontend/awx/common/AwxPageForm.tsx

export function AwxPageForm<T extends object>(props: {
  children?: ReactNode;
  onSubmit: (data: T) => Promise<unknown>;
  defaultValue?: T;
  optionsData?: OptionsResponse;  // 👈 Add this prop
  // ... other props
}) {
  return (
    <PageForm
      {...props}
      optionsData={props.optionsData}  // 👈 Pass through
      errorAdapter={awxErrorAdapter}
    >
      {props.children}
    </PageForm>
  );
}
```

#### B. In forms that already fetch OPTIONS

Many forms already fetch OPTIONS for dropdown choices:

```typescript
// BEFORE: Already fetching OPTIONS for choices
const { data: optionsData } = useOptions('/api/v2/inventories/');

// Create inventory source choices from OPTIONS
const sourceChoices = useMemo(
  () => optionsData?.actions?.POST?.source?.choices || [],
  [optionsData]
);

// AFTER: Just pass the same data to the form!
<AwxPageForm
  onSubmit={onSubmit}
  defaultValue={inventory}
  optionsData={optionsData}  // 👈 One line added!
>
  <PageFormTextInput name="name" label="Name" isRequired />
  <PageFormSelect name="source" options={sourceChoices} />
</AwxPageForm>
```

#### C. With custom validation (both work together)

```typescript
<PageFormTextInput
  name="name"
  label="Name"
  isRequired
  validate={(value) => {
    // OPTIONS pattern runs FIRST (if field is dirty)
    // Then this custom validation runs
    
    if (value === 'admin') {
      return 'Name "admin" is reserved';
    }
    
    return true;
  }}
/>
```

**Validation order:**
1. ✅ OPTIONS pattern check (if dirty)
2. ✅ Custom validate function
3. If either fails → show error

### Migration path

#### Phase 1: Zero changes (backward compatible)
Existing forms work unchanged. No patterns applied.

#### Phase 2: Add optionsData prop (opt-in per form)
```typescript
// Forms already fetching OPTIONS - just pass it through
<AwxPageForm optionsData={optionsData}>
```

Forms get validation automatically for fields with patterns.

#### Phase 3: Backend deploys patterns (opt-in per field)
Backend adds patterns to OPTIONS responses field-by-field.
UI automatically picks them up - no frontend code changes needed.

### Troubleshooting

**Q: Why isn't validation working?**

Check:
1. Is `optionsData` passed to PageForm? `console.log(optionsData)`
2. Does OPTIONS response have `pattern` field? Check network tab
3. Is field dirty? Validation only runs on changed fields
4. Is field a PageFormTextInput/TextArea? Other input types not supported yet

**Q: Backend uses camelCase (`patternDescription`) instead of snake_case?**

✅ Both are supported! The implementation automatically checks for:
- `pattern_description` (snake_case - preferred)
- `patternDescription` (camelCase - also supported)

This handles different backend serialization formats.

**Q: Pattern uses Unicode property escapes (`\p{L}`, `\p{N}`) and doesn't work?**

✅ The implementation supports regex `flags` from OPTIONS! If your backend sends:
```json
{
  "pattern": "^[\\p{L}\\p{N}_]...",
  "flags": "u"
}
```

The UI will create the RegExp with Unicode support: `new RegExp(pattern, 'u')`

This is required for patterns using Unicode character classes.

**Q: Can I disable OPTIONS validation for a specific field?**

Not currently, but you can:
- Not pass `optionsData` to the form (disables for all fields)
- Ask backend to remove pattern from OPTIONS for that field

**Q: What if OPTIONS pattern and my custom validate both fail?**

OPTIONS pattern runs first. If it fails, that error shows.
Custom validate still runs, but only first error displays.

## How it works

### For form developers

```typescript
// 1. Fetch OPTIONS data (you probably already do this)
const { data: optionsData } = useOptions('/api/v2/job_templates/');

// 2. Pass it to your PageForm wrapper  
<AwxPageForm
  onSubmit={onSubmit}
  defaultValue={jobTemplate}
  optionsData={optionsData}  // <-- Just add this
>
  <PageFormTextInput name="name" label="Name" />
  {/* Validation happens automatically! */}
</AwxPageForm>
```

### Validation flow

1. **Backend** exposes `pattern` and `pattern_description` in OPTIONS response:
   ```json
   {
     "actions": {
       "POST": {
         "name": {
           "pattern": "^[a-zA-Z0-9_-]+$",
           "pattern_description": "Name must contain only letters, numbers, underscores, and hyphens"
         }
       }
     }
   }
   ```

2. **PageForm** extracts field metadata and provides it via context

3. **PageFormTextInput/TextArea** auto-discovers pattern by field name:
   - Compares value to defaultValue to check if dirty
   - Only validates if field is dirty (grandfathering)
   - Uses pattern_description as error message
   - Triggers validation on blur

### Validation ordering

When both OPTIONS pattern and custom `validate` prop exist:

1. **OPTIONS pattern validation** runs first (only if dirty)
2. **Custom validate functions** run second

This ensures backend rules are enforced before custom UI validations.

## Backward compatibility

- **No optionsData prop**: Context is empty, no validation applied
- **OPTIONS without pattern**: Field works normally
- **Existing validate prop**: Still works, runs after OPTIONS validation
- **No breaking changes**: All existing forms continue to work unchanged

## isDirty gating (grandfathering)

Fields with invalid default values (from the backend) are not validated until the user changes them:

```typescript
// Edit form with existing resource
defaultValue={{ name: "existing@invalid" }}  // Has @ which violates pattern

// User focuses field and blurs without changing → NO validation error
// User changes to "new@invalid" and blurs → validation error appears
```

This matches the backend's `self.instance` comparison exactly.

## Key files changed

- `framework/PageForm/PageFormOptionsContext.tsx` (NEW)
- `framework/PageForm/PageForm.tsx` (modified)
- `framework/PageForm/Inputs/PageFormTextInput.tsx` (modified)
- `framework/PageForm/Inputs/PageFormTextArea.tsx` (modified)
- `frontend/awx/interfaces/OptionsResponse.ts` (modified)
- `framework/PageForm/PageFormOptionsContext.test.tsx` (NEW)
- `framework/PageForm/Inputs/PageFormTextArea.test.tsx` (modified - added tests)

## Acceptance criteria

✅ All 8 acceptance criteria met:

1. New `PageFormOptionsContext` created and provided by PageForm when `optionsData` is passed
2. PageFormTextInput auto-discovers `pattern` from context and applies validation with isDirty gating
3. PageFormTextArea does the same
4. onBlur triggers validation for fields with OPTIONS-provided patterns
5. Fields without patterns (toggle off or optionsData not passed) are completely unaffected
6. Validation ordering: OPTIONS pattern fires first, existing `validate` prop fires second
7. POST and PATCH/PUT actions both checked for patterns
8. Vitest unit tests covering all scenarios

## Testing

Run tests:
```bash
npm run test -- framework/PageForm/PageFormOptionsContext.test.tsx --run
npm run test -- framework/PageForm/Inputs/PageFormTextArea.test.tsx --run
```

All tests passing ✅

---

# Phase 2 Extension: Composable Field Metadata Provider & PageWizard Support

## Overview

This extension (follow-up to AAP-78724 core) adds:
1. **PageWizard optionsData support** — single-resource wizards can now apply OPTIONS-driven validation to all steps
2. **Composable field metadata primitives** — enabling scenarios where multiple resources' patterns coexist in a single form
3. **Smart field-name lookup with override** — forms with nested field names (e.g., `organization.name`) work automatically without wiring changes

## New Primitives

### 1. `extractPageFormOptionsFields(optionsData)`
Pure function that extracts a flat `{ fieldName: FieldMetadata }` map from a DRF-OPTIONS response.

**File**: `framework/PageForm/PageFormOptionsContext.tsx`

```typescript
// Input: raw OPTIONS response
const optionsData = {
  actions: {
    POST: {
      name: { pattern: '^[a-z]+$', pattern_description: 'lowercase only' }
    }
  }
};

// Output: normalized field metadata map
const fields = extractPageFormOptionsFields(optionsData);
// { name: { pattern: '^[a-z]+$', pattern_description: 'lowercase only', flags: undefined } }
```

### 2. `usePageFormOptionsFields(optionsData)`
Memoized hook version of the extraction — used by PageForm internally to avoid re-extracting on every render.

### 3. `PageFormFieldMetadataProvider`
**The key primitive for enabling Phase 2 work (AAP-87604).**

Source-agnostic provider that accepts an already-built field metadata map from any source:

```typescript
// Can wrap any metadata source — not just DRF OPTIONS
const fields = extractCredentialTypeFieldMetadata(credentialType);
const fields = extractNotificationTypeMetadata(notificationType);
const fields = extractPluginSchemaMetadata(pluginSchema);

return (
  <PageFormFieldMetadataProvider fields={fields} merge={false}>
    <PageFormTextInput name="username" ... />
    <PageFormTextInput name="password" ... />
  </PageFormFieldMetadataProvider>
);
```

**Props:**
- `fields: Record<string, FieldMetadata>` — the metadata map (source-agnostic)
- `merge?: boolean` — when true, layers on top of ambient context; when false (default), replaces it
- `children: ReactNode` — wrapped content

### 4. `PageFormOptionsProvider`
Convenience wrapper for the DRF-OPTIONS case. Used by PageForm internally; also available for scenarios where you're composing multiple OPTIONS sources.

```typescript
<PageFormOptionsProvider optionsData={data} merge>
  <PageFormFieldMetadataProvider fields={customFields} merge>
    {/* Both contexts are available */}
  </PageFormFieldMetadataProvider>
</PageFormOptionsProvider>
```

**Props:**
- `optionsData?: PageFormOptionsData` — raw OPTIONS response
- `merge?: boolean` — layer on top of ambient context
- `children: ReactNode`

### 5. Enhanced `usePageFormOptionsContext(name, optionsFieldName?)`
Updated to support nested field names with automatic last-segment lookup.

**Smart default behavior:**
- `organization.name` → looks up key `name`
- `prompt.limit` → looks up key `limit`
- `credential_passwords.ssh_password` → looks up key `ssh_password`

**Escape hatch for collisions:**
```typescript
// If two fields in the same form both end in `.name`, use optionsFieldName override
const metadata = usePageFormOptionsContext('organization.name', 'explicit_key');
```

## Enabling the Four Scenarios

### Scenario 1: Single-Resource Wizard (`ScheduleAddWizard`)

**Before:** Wizard steps couldn't access OPTIONS-driven validation.

**After:**

```typescript
// In ScheduleAddWizard.tsx
const { data: optionsData } = useOptions(awxAPI`/schedules/`);

<PageWizard<ScheduleFormWizard>
  steps={steps}
  optionsData={optionsData}  // ← NEW: Pass OPTIONS once
  onSubmit={handleSubmit}
  // ... other props
/>
```

All steps automatically discover patterns — no changes needed to step components.

**Files changed:**
- `framework/PageWizard/PageWizard.tsx` — added `optionsData` prop
- `framework/PageWizard/PageWizardBody.tsx` — forwards to internal PageForm
- `framework/PageWizard/types.ts` — documented on PageWizardBody interface

### Scenario 2: Concurrent Multi-Resource in One Step (`PlatformOrganizationForm`)

**Before:** Step had fields from two services (Gateway org + Controller org). Only one resource's patterns could be applied.

**After:**

```typescript
// At wizard level: Gateway organization OPTIONS
<PageWizard optionsData={gatewayOrgOptions} ...>

// Inside the details step: ControllerOrganizationDetails
function ControllerOrganizationDetails() {
  const { data: controllerOptions } = useOptions(awxAPI`/organizations/`);
  const fields = extractPageFormOptionsFields(controllerOptions);
  
  return (
    <PageFormFieldMetadataProvider fields={fields} merge>
      {/* Merges with ambient Gateway org context */}
      <PageFormTextInput name="maxHosts" ... />
      <PageFormTextInput name="policy" ... />
    </PageFormFieldMetadataProvider>
  );
}
```

Both field sets coexist: Gateway org's `name`/`description` from the wizard level, plus Controller org's `maxHosts`/`policy` from the merged provider.

### Scenario 3: Runtime-Divergent Resource in One Step (`NodeTypeStep`)

**Before:** Step branched on node type (workflow_approval, job, project update, etc.), but only one branch had fields that could be validated.

**After:**

```typescript
case RESOURCE_TYPE.workflow_approval:
  return <ApprovalNameFields />;

function ApprovalNameFields() {
  const { data } = useOptions(awxAPI`/workflow_approval_templates/`);
  const fields = extractPageFormOptionsFields(data);
  
  return (
    <PageFormFieldMetadataProvider fields={fields}>
      <PageFormTextInput name="approval_name" ... />
      <PageFormTextInput name="approval_description" ... />
    </PageFormFieldMetadataProvider>
  );
}
```

Metadata is reactive: when the user changes node type, the provider re-renders with the new resource's fields.

### Scenario 4: Nested Field Names (`TemplateLaunchWizard`, `PlatformOrganizationForm`)

**Before:** Forms using nested names like `prompt.limit`, `organization.name`, `credential_passwords.ssh_password` would need custom wiring to match bare OPTIONS keys.

**After:** Automatic last-segment lookup in `usePageFormOptionsContext`:

```typescript
// Form field name
<PageFormTextInput name="organization.name" ... />

// usePageFormOptionsContext is called internally with name="organization.name"
// Smart default: looks up OPTIONS key "name" automatically
// No wiring needed!
```

## Foundation for AAP-87604 (Phase 2: JSON Sub-Keys)

AAP-87604 targets five forms with JSON sub-key patterns (credentials, notifiers, etc.). The new primitives enable this without requiring changes to `PageWizard`:

```typescript
// CredentialForm example (not yet implemented, but now possible)
function CredentialForm({ credentialType }) {
  const fields = extractCredentialTypeFieldMetadata(credentialType);
  // Extract from credential.type.inputs.fields — custom source
  
  return (
    <PageForm>
      <PageFormFieldMetadataProvider fields={fields}>
        <PageFormTextInput name="username" ... />
        <PageFormTextInput name="password" ... />
      </PageFormFieldMetadataProvider>
    </PageForm>
  );
}
```

Each form's custom extraction → `PageFormFieldMetadataProvider` → validated fields. No new context layers, no special `PageWizardStep.optionsData` API.

## Test Coverage

### New Tests

- **`PageFormOptionsContext.test.tsx`** (22 new tests):
  - `extractPageFormOptionsFields`: 8 tests (empty, POST/PUT/PATCH, camelCase support, flags, collisions)
  - `usePageFormOptionsFields`: 2 tests (memoization, recomputation)
  - `usePageFormOptionsContext`: 5 tests (bare lookup, nested segments, override, missing keys)
  - `PageFormFieldMetadataProvider`: 5 tests (basic, replace vs. merge, collision handling)
  - `PageFormOptionsProvider`: 3 tests (extraction, merge, undefined data)

- **`PageWizardBody.test.tsx`** (2 new tests):
  - optionsData forwarding to step form
  - absence of optionsData doesn't break

- **`PageWizard.test.tsx`** (1 new test):
  - optionsData reaches step inputs end-to-end

All 122 framework tests pass.

## API Summary

| Symbol | File | Purpose |
|--------|------|---------|
| `extractPageFormOptionsFields()` | PageFormOptionsContext.tsx | Pure extraction: OPTIONS → field metadata |
| `usePageFormOptionsFields()` | PageFormOptionsContext.tsx | Memoized extraction hook |
| `PageFormFieldMetadataProvider` | PageFormOptionsContext.tsx | Source-agnostic, mergeable provider |
| `PageFormOptionsProvider` | PageFormOptionsContext.tsx | DRF-OPTIONS convenience wrapper |
| `usePageFormOptionsContext(name, optionsFieldName?)` | PageFormOptionsContext.tsx | Smart lookup (last-segment default + override) |
| `optionsData` prop | PageWizard | Single-resource wizard support |
| `optionsData` prop | PageWizardBody | Internal forwarding |
| `optionsData` prop | PageForm | Already existed; refactored to use provider |
| `optionsFieldName` prop | PageFormTextInput | Field-name override for collisions |
| `optionsFieldName` prop | PageFormTextArea | Field-name override for collisions |

## Backward Compatibility

✅ Zero breaking changes:
- All new symbols are additions (exports, props)
- Existing code path unchanged when props omitted
- Refactor of `PageForm` internals is pure behavior-preservation
- Framework tests all pass unmodified

## Migration Path for Forms

### Today (AAP-78724 core)
```typescript
// Existing forms, no changes
<PageForm optionsData={optionsData}>
```

### Soon (this extension)
```typescript
// Wizards gain support
<PageWizard optionsData={optionsData} steps={steps} ... />

// Multi-resource steps gain compose support
<PageFormFieldMetadataProvider fields={customFields} merge>
```

### Phase 2 (AAP-87604)
```typescript
// JSON sub-key forms can wire themselves
<PageFormFieldMetadataProvider fields={extractCredentialFields(...)}>
  <PageFormTextInput name="username" ... />
</PageFormFieldMetadataProvider>
```

## Next steps

To use this feature in your forms:

### Single-resource wizard
```typescript
const { data: optionsData } = useOptions(awxAPI`/path/`);
<PageWizard optionsData={optionsData} steps={steps} ... />
```

### Multi-resource step (merge case)
```typescript
// Wizard level: main resource
<PageWizard optionsData={mainOptions} ...>

// Inside step: secondary resource
const fields = extractPageFormOptionsFields(secondaryOptions);
<PageFormFieldMetadataProvider fields={fields} merge>
  {/* Both contexts available */}
</PageFormFieldMetadataProvider>
```

### Custom metadata source (AAP-87604 prep)
```typescript
const fields = extractCustomMetadata(mySource);
<PageFormFieldMetadataProvider fields={fields}>
  {/* Any metadata shape, injected as-is */}
</PageFormFieldMetadataProvider>
```

For the full platform rollout, see:
- Parent epic: [AAP-74630](https://redhat.atlassian.net/browse/AAP-74630)
- Feature epic: [ANSTRAT-1756](https://redhat.atlassian.net/browse/ANSTRAT-1756)
- Phase 2 story: [AAP-87604](https://redhat.atlassian.net/browse/AAP-87604)
