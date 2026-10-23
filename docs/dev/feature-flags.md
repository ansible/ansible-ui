# Client-only feature flags

This document describes a small proof of concept for feature flags that affect
only client-side presentation or behavior. The POC is intentionally not wired
to a product screen; it is a reviewable contract for discussion.

## Goals

- Keep definitions typed and discoverable.
- Keep each shipped on/off value in source-controlled JSON so changes are reviewed in a PR.
- Use `false` as the fallback when a flag value is missing or evaluation fails.
- Keep flag evaluation behind an explicit provider boundary.
- Store only non-sensitive per-user preferences in browser storage for local development.
- Pass environment and targeting context to a provider without putting secrets in the client.
- Record an owner and removal date for every flag.
- Make unknown flags and malformed storage fail closed.
- Keep feature flags separate from authorization, entitlement, secrets, and
  backend rollout controls.

## Example

```tsx
import featureFlagConfig from './feature-flags.json';
import {
  createFeatureFlagConfigProvider,
  createFeatureFlagDefinitions,
  createFeatureFlagRegistry,
  createFeatureFlagScope,
} from '@ansible/ansible-ui-framework';
import type { FeatureFlagCatalogEntry } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';

// Import the app-owned JSON file; the docs/dev JSON is this example's fixture.
const catalog = featureFlagConfig.flags as readonly FeatureFlagCatalogEntry[];
const definitions = createFeatureFlagDefinitions(catalog);
const configProvider = createFeatureFlagConfigProvider(catalog);
const registry = createFeatureFlagRegistry(definitions, {
  provider: configProvider,
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

The application owns one JSON config, one registry, and one React scope. The
`enabled` boolean is the shipped on/off value. A PR that changes it takes effect
when the application is built and deployed; it is not a live runtime switch.
`createFeatureFlagDefinitions` keeps the safe fallback at `false`, while
`createFeatureFlagConfigProvider` supplies the checked-in JSON value. The
`FEATURE_<NAME>_ENABLED` identifier follows the existing AWX convention.

## Provider boundary

Application code depends on the typed scope. The source-controlled config
provider reads the JSON `enabled` values when the app loads. Changing a value
through a PR takes effect after that app build is deployed; there is no live
runtime switch or polling service.

Definitions always use the safe fallback `defaultValue: false`. A missing,
unready, or failed provider therefore leaves the feature off and reports the
evaluation reason.

## Public catalog

The app-owned JSON is the source of truth for each shipped toggle. Validation
rejects duplicate names, invalid boolean values, malformed removal dates, and
unexpected fields. [`feature-flags.json`](./feature-flags.json) is the example
config used by the tests; the companion [`feature-flags.schema.json`](./feature-flags.schema.json)
provides editor validation. The JSON `enabled` value may be `true` or `false`;
registry defaults and provider failures remain off. The value applies to builds
that import that config; use environment-specific config files when development
and production need different values.

## Development workflow

For a local experiment, a development build can use the local provider and
enable a flag for a working session with the registry API:

```ts
import { createLocalFeatureFlagProvider } from '@ansible/ansible-ui-framework';

const localProvider = createLocalFeatureFlagProvider();
localProvider.setOverride('FEATURE_EXAMPLE_VIEW_ENABLED', true);
```

If the application exposes the registry in a local development harness, the
same override can be stored in the browser console:

```js
localStorage.setItem('ui:feature-flags', '{"FEATURE_EXAMPLE_VIEW_ENABLED":true}');
```

Do not commit local overrides. To change the shipped value, update the app-owned
JSON in a PR and deploy that change. Remove the local override with
`localProvider.resetOverride('FEATURE_EXAMPLE_VIEW_ENABLED')` or
by clearing the `ui:feature-flags` browser-storage entry when testing the
default-off path.

## Safety boundaries

Client-only flags are not a security boundary. Never use them to grant access,
protect secrets, enforce permissions, or control backend behavior. A user can
change browser storage. Keep authorization and backend controls server-side.

Before production use, each flag should have a named owner, a removal date, a
flag-off test, a flag-on test, and a documented decision about whether the
behavior can be safely backported. A client-side flag only controls presentation;
it cannot protect permissions, backend behavior, or secrets.
