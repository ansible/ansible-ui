# Client-only feature flags

This document describes a small proof of concept for feature flags that affect
only client-side presentation or behavior. The POC is intentionally not wired
to a product screen; it is a reviewable contract for discussion.

## Goals

- Keep definitions typed and discoverable.
- Default every flag to `false`; a provider can enable it for a configured environment.
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
    name: 'FEATURE_EXAMPLE_VIEW_ENABLED',
    defaultValue: false,
    description: 'Example of an unfinished client-only view.',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
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
  const isExampleViewEnabled = featureFlags.useFeatureFlag('FEATURE_EXAMPLE_VIEW_ENABLED');

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
catalog uses `FEATURE_<NAME>_ENABLED` identifiers, matching the existing AWX
feature-flag convention. The registry delegates evaluation to its provider and
returns evaluation details
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

The catalog and registry require `defaultValue: false`. A missing, unready, or
failed provider therefore leaves the feature off and reports the evaluation
reason.

## Public catalog

The typed catalog in application code is the source of truth. Its validation
rejects duplicate names, malformed removal dates, unexpected fields, and
defaults other than `false`. [`feature-flags.json`](./feature-flags.json) is the
public catalog mirror, and its corresponding test keeps it valid and usable as
registry definitions. The companion [`feature-flags.schema.json`](./feature-flags.schema.json)
continues to provide editor validation. The provider supplies the on/off value
for its environment; missing or failed providers leave the flag off.

## Development workflow

Every flag definition uses `defaultValue: false`. A development provider can
enable a flag locally for a working session with the registry API:

```ts
localProvider.setOverride('FEATURE_EXAMPLE_VIEW_ENABLED', true);
```

If the application exposes the registry in a local development harness, the
same override can be stored in the browser console:

```js
localStorage.setItem('ui:feature-flags', '{"FEATURE_EXAMPLE_VIEW_ENABLED":true}');
```

Do not commit either override. CI and other users keep the feature hidden unless
their configured provider explicitly enables it. Remove the local override with
`localProvider.resetOverride('FEATURE_EXAMPLE_VIEW_ENABLED')` or
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
