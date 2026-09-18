# Client-only feature flags

This document describes a small proof of concept for feature flags that affect
only client-side presentation or behavior. The POC is intentionally not wired
to a product screen; it is a reviewable contract for discussion.

## Goals

- Keep definitions typed and discoverable.
- Default flags to a safe value, normally `false` for unfinished UI.
- Store only non-sensitive per-user preferences in browser storage.
- Record an owner and removal date for every flag.
- Make unknown flags and malformed storage fail closed.
- Keep feature flags separate from authorization, entitlement, secrets, and
  backend rollout controls.

## Example

```tsx
import { createFeatureFlagRegistry, useFeatureFlag } from '@ansible/ansible-ui-framework';

const flags = createFeatureFlagRegistry({
  exampleView: {
    defaultValue: false,
    description: 'Example of an unfinished client-only view.',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
  },
} as const);

function ExampleViewToggle() {
  const isExampleViewEnabled = useFeatureFlag(flags, 'exampleView');

  return isExampleViewEnabled ? <ExampleView /> : null;
}
```

The registry persists explicit overrides under a namespaced browser-storage
key. Calling `reset` removes the override and returns the flag to its declared
default. The hook subscribes to registry changes so multiple consumers stay in
sync.

## Safety boundaries

Client-only flags are not a security boundary. Never use them to grant access,
protect secrets, enforce permissions, or control backend behavior. A user can
change browser storage. Use server-side authorization and runtime flags for
those concerns.

Before production use, each flag should have a named owner, a removal date, a
flag-off test, a flag-on test, and a documented decision about whether the
behavior can be safely backported.
