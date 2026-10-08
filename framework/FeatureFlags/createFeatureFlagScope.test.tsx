import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, describe, it } from 'vitest';
import { createFeatureFlagScope } from './createFeatureFlagScope';
import { createFeatureFlagRegistry, createLocalFeatureFlagProvider } from './FeatureFlagRegistry';

const definitions = {
  unfinishedView: {
    defaultValue: false,
    description: 'A default-off view.',
    kind: 'release',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    scope: 'client-only',
    status: 'proposed',
  },
} as const;

const featureFlags = createFeatureFlagScope<typeof definitions>();

describe('createFeatureFlagScope', () => {
  it('updates a consumer when an enabled local flag changes', () => {
    const provider = createLocalFeatureFlagProvider();
    const registry = createFeatureFlagRegistry(definitions, { provider });
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <featureFlags.FeatureFlagProvider registry={registry}>
        {children}
      </featureFlags.FeatureFlagProvider>
    );
    const { result } = renderHook(() => featureFlags.useFeatureFlag('unfinishedView'), {
      wrapper,
    });

    expect(result.current).toBe(false);

    act(() => provider.setOverride('unfinishedView', true));

    expect(result.current).toBe(true);
  });
});
