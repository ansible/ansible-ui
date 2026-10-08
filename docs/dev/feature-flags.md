# Client-only feature flags

This document describes a small proof of concept for feature flags that affect
only client-side presentation or behavior. The POC is intentionally not wired
to a product screen; it is a reviewable contract for discussion.

## Goals

- Keep definitions typed and discoverable.
- Default flags to a safe value, normally `false` for unfinished UI.
- Track lifecycle status separately from the current enabled state.
- Keep flag evaluation behind an explicit provider boundary.
- Store only non-sensitive per-user preferences in browser storage for local development.
- Pass environment and targeting context to a provider without putting secrets in the client.
- Record an owner and removal date for every flag.
- Make unknown flags and malformed storage fail closed.
- Keep feature flags separate from authorization, entitlement, secrets, and
  backend rollout controls.

## Example

```tsx
import {
  createFeatureFlagDefinitions,
  createFeatureFlagRegistry,
  createLocalFeatureFlagProvider,
  createFeatureFlagScope,
} from '@ansible/ansible-ui-framework';
import type { FeatureFlagCatalogEntry } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';

const catalog = [
  {
    name: 'example-view',
    defaultValue: false,
    description: 'Example of an unfinished client-only view.',
    kind: 'release',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    scope: 'client-only',
    status: 'proposed',
  },
] as const satisfies readonly FeatureFlagCatalogEntry[];

const definitions = createFeatureFlagDefinitions(catalog);
const localProvider = createLocalFeatureFlagProvider();
const registry = createFeatureFlagRegistry(definitions, {
  context: { environment: 'development' },
  provider: localProvider,
});
const featureFlags = createFeatureFlagScope<typeof definitions>();

function ExampleApp() {
  return (
    <featureFlags.FeatureFlagProvider registry={registry}>
      <ExampleViewToggle />
    </featureFlags.FeatureFlagProvider>
  );
}

function ExampleViewToggle() {
  const isExampleViewEnabled = featureFlags.useFeatureFlag('example-view');

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

The application owns one typed catalog, one registry, and one React scope. The
registry delegates evaluation to its provider and returns evaluation details
including the source/reason. With no provider, the registry returns the code
default. The local provider persists explicit overrides under a namespaced
browser-storage key; a production provider should instead read the approved
runtime flag service.

## Provider boundary

Application code should depend on the typed scope, not on a vendor SDK or a
specific transport. A future runtime provider can initialize asynchronously,
receive context changes, and notify the registry when values change while
preserving the same application-facing API:

```ts
const registry = createFeatureFlagRegistry(definitions, {
  context: { environment: 'devel', targetingKey: 'development-user' },
  provider: runtimeFeatureFlagProvider,
});

await registry.ready();
await registry.setContext({ environment: 'devel', targetingKey: 'new-user' });
```

Until a provider is ready, and when it fails or returns invalid data, the
registry returns the catalog default with an error reason. Do not expose a
default-on unfinished feature while the provider is initializing.

## Public catalog

The typed catalog in application code is the source of truth. Its validation
rejects duplicate names, malformed removal dates, unexpected fields, and
default-on proposed flags. [`feature-flags.json`](./feature-flags.json) is the
public catalog mirror, and its corresponding test keeps it valid and usable as
registry definitions. The companion [`feature-flags.schema.json`](./feature-flags.schema.json)
continues to provide editor validation. The `status` field describes lifecycle
(`proposed`, `alpha`, `beta`, `production`, or `deprecated`); it does not claim
that a flag is enabled for every user. `defaultValue` and the provider result
determine client behavior.

## Development workflow

Keep the committed catalog and registry definition at `defaultValue: false`
while the feature is unfinished. A developer can enable the flag locally for a
working session with the registry API:

```ts
localProvider.setOverride('example-view', true);
```

If the application exposes the registry in a local development harness, the
same override can be stored in the browser console:

```js
localStorage.setItem('ui:feature-flags', '{"example-view":true}');
```

Do not commit either override. Before merging to `devel`, keep the catalog and
code default at `false`; CI and other users will therefore keep the unfinished
feature hidden. Remove the local override with
`localProvider.resetOverride('example-view')` or
by clearing the `ui:feature-flags` browser-storage entry when testing the
default-off path.

## Safety boundaries

Client-only flags are not a security boundary. Never use them to grant access,
protect secrets, enforce permissions, or control backend behavior. A user can
change browser storage. Use server-side authorization and the approved runtime
flag service for those concerns.

Before production use, each flag should have a named owner, a removal date, a
flag-off test, a flag-on test, and a documented decision about whether the
behavior can be safely backported. Keep the production provider adapter in its
own PR after the runtime service is selected; do not add an unapproved service
or client credentials to this shared framework layer.
