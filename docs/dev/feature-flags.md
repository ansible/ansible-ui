# Client-only feature flags

This document describes a small proof of concept for feature flags that affect
only client-side presentation or behavior. The POC is intentionally not wired
to a product screen; it is a reviewable contract for discussion.

## Goals

- Keep definitions typed and discoverable.
- Default flags to a safe value, normally `false` for unfinished UI.
- Track lifecycle status separately from the current enabled state.
- Store only non-sensitive per-user preferences in browser storage.
- Record an owner and removal date for every flag.
- Make unknown flags and malformed storage fail closed.
- Keep feature flags separate from authorization, entitlement, secrets, and
  backend rollout controls.

## Example

```tsx
import { createFeatureFlagRegistry, useFeatureFlag } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';

const flags = createFeatureFlagRegistry({
  'example-view': {
    defaultValue: false,
    description: 'Example of an unfinished client-only view.',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    status: 'proposed',
  },
} as const);

function ExampleViewToggle() {
  const isExampleViewEnabled = useFeatureFlag(flags, 'example-view');

  return isExampleViewEnabled ? <ExampleView /> : null;
}

function ExampleView() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="example-view-title">
      <h2 id="example-view-title">{t('Example view')}</h2>
      <p>{t('This small client-only feature is visible only when enabled.')}</p>
    </section>
  );
}
```

The registry persists explicit overrides under a namespaced browser-storage
key. Calling `reset` removes the override and returns the flag to its declared
default. The hook subscribes to registry changes so multiple consumers stay in
sync.

## Public catalog

[`feature-flags.json`](./feature-flags.json) is the extendable
public catalog. Add another object to its `flags` array when proposing a
client-only flag. The companion [`feature-flags.schema.json`](./feature-flags.schema.json)
provides editor validation for the catalog. It is documentation and inventory,
not runtime configuration. The `status` field describes lifecycle (`proposed`, `alpha`,
`beta`, `production`, or `deprecated`); it does not claim that a flag is
enabled for every user. `defaultValue` and the per-user override determine the
client behavior.

## Development workflow

Keep the committed catalog and registry definition at `defaultValue: false`
while the feature is unfinished. A developer can enable the flag locally for a
working session with the registry API:

```ts
flags.setEnabled('example-view', true);
```

If the application exposes the registry in a local development harness, the
same override can be stored in the browser console:

```js
localStorage.setItem('ui:feature-flags', '{"example-view":true}');
```

Do not commit either override. Before merging to `devel`, keep the catalog and
code default at `false`; CI and other users will therefore keep the unfinished
feature hidden. Remove the local override with `flags.reset('example-view')` or
by clearing the `ui:feature-flags` browser-storage entry when testing the
default-off path.

## Safety boundaries

Client-only flags are not a security boundary. Never use them to grant access,
protect secrets, enforce permissions, or control backend behavior. A user can
change browser storage. Use server-side authorization and runtime flags for
those concerns.

Before production use, each flag should have a named owner, a removal date, a
flag-off test, a flag-on test, and a documented decision about whether the
behavior can be safely backported.
