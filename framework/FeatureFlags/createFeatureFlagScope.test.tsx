import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, describe, it } from 'vitest';
import { createFeatureFlagScope } from './createFeatureFlagScope';
import { createFeatureFlagRegistry, createLocalFeatureFlagProvider } from './FeatureFlagRegistry';

const definitions = {
  FEATURE_UNFINISHED_VIEW_ENABLED: {
    defaultValue: false,
    description: 'A default-off view.',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
  },
} as const;

const featureFlags = createFeatureFlagScope<typeof definitions>();

function FeatureFlagValue() {
  return <span>{String(featureFlags.useFeatureFlag('FEATURE_UNFINISHED_VIEW_ENABLED'))}</span>;
}

describe('createFeatureFlagScope', () => {
  it('requires a provider for consumers', () => {
    expect(() =>
      renderHook(() => featureFlags.useFeatureFlag('FEATURE_UNFINISHED_VIEW_ENABLED'))
    ).toThrow('useFeatureFlag must be used inside FeatureFlagProvider');
  });

  it('updates a consumer when an enabled local flag changes', () => {
    const provider = createLocalFeatureFlagProvider();
    const registry = createFeatureFlagRegistry(definitions, { provider });
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <featureFlags.FeatureFlagProvider registry={registry}>
        {children}
      </featureFlags.FeatureFlagProvider>
    );
    const { result } = renderHook(
      () => featureFlags.useFeatureFlag('FEATURE_UNFINISHED_VIEW_ENABLED'),
      {
        wrapper,
      }
    );

    expect(result.current).toBe(false);

    act(() => provider.setOverride('FEATURE_UNFINISHED_VIEW_ENABLED', true));

    expect(result.current).toBe(true);
  });

  it('uses the registry snapshot when rendered on the server', () => {
    const registry = createFeatureFlagRegistry(definitions);
    const markup = renderToString(
      <featureFlags.FeatureFlagProvider registry={registry}>
        <FeatureFlagValue />
      </featureFlags.FeatureFlagProvider>
    );

    expect(markup).toContain('<span>false</span>');
  });
});
