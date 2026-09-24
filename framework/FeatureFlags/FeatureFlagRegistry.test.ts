import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeatureFlagRegistry, createLocalFeatureFlagProvider } from './FeatureFlagRegistry';
import type { FeatureFlagDefinitions, FeatureFlagProvider } from './FeatureFlagRegistry';
import { useFeatureFlag } from './useFeatureFlag';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const definitions = {
  experimentalView: {
    defaultValue: false,
    description: 'Example experimental view.',
    kind: 'release',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    scope: 'client-only',
    status: 'proposed',
  },
  defaultOnView: {
    defaultValue: true,
    description: 'Example default-on view.',
    kind: 'operational',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    scope: 'client-only',
    status: 'production',
  },
} satisfies FeatureFlagDefinitions;

describe('createFeatureFlagRegistry', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('uses the definition default when no provider is configured', () => {
    const registry = createFeatureFlagRegistry(definitions);

    expect(registry.evaluate('experimentalView')).toEqual({
      flagKey: 'experimentalView',
      reason: 'DEFAULT',
      value: false,
    });
  });

  it('uses local overrides only through the explicit local provider', () => {
    const provider = createLocalFeatureFlagProvider({
      storage,
      storageKey: 'test-flags',
    });
    const registry = createFeatureFlagRegistry(definitions, {
      context: { environment: 'development' },
      provider,
    });

    expect(registry.isEnabled('experimentalView')).toBe(false);
    provider.setOverride('experimentalView', true);
    expect(registry.evaluate('experimentalView')).toEqual({
      flagKey: 'experimentalView',
      reason: 'LOCAL_OVERRIDE',
      value: true,
    });

    const restoredProvider = createLocalFeatureFlagProvider({
      storage,
      storageKey: 'test-flags',
    });
    const restoredRegistry = createFeatureFlagRegistry(definitions, {
      provider: restoredProvider,
    });
    expect(restoredRegistry.isEnabled('experimentalView')).toBe(true);
  });

  it('fails closed to the definition default when local storage is malformed', () => {
    storage.setItem('test-flags', '{not-json');
    const provider = createLocalFeatureFlagProvider({
      storage,
      storageKey: 'test-flags',
    });
    const registry = createFeatureFlagRegistry(definitions, { provider });

    expect(registry.isEnabled('experimentalView')).toBe(false);
    expect(registry.isEnabled('defaultOnView')).toBe(true);
  });

  it('keeps local overrides usable without browser storage', () => {
    vi.stubGlobal('window', undefined);

    try {
      const provider = createLocalFeatureFlagProvider();
      const listener = vi.fn();
      provider.subscribe?.(listener);

      provider.setOverride('experimentalView', true);
      provider.setOverride('experimentalView', true);
      provider.resetOverride('missing');
      provider.resetOverride('experimentalView');

      expect(provider.evaluateBoolean('experimentalView', false)).toEqual({
        flagKey: 'experimentalView',
        reason: 'DEFAULT',
        value: false,
      });
      expect(listener).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('ignores stored overrides with an invalid shape', () => {
    storage.setItem('test-flags', JSON.stringify({ experimentalView: 'enabled' }));
    const provider = createLocalFeatureFlagProvider({
      storage,
      storageKey: 'test-flags',
    });

    expect(provider.evaluateBoolean('experimentalView', false)).toEqual({
      flagKey: 'experimentalView',
      reason: 'DEFAULT',
      value: false,
    });
  });

  it('returns a safe fallback and error reason when a provider fails', () => {
    const provider: FeatureFlagProvider = {
      name: 'failing-provider',
      evaluateBoolean: () => {
        throw new Error('provider unavailable');
      },
    };
    const registry = createFeatureFlagRegistry(definitions, { provider });

    expect(registry.evaluate('experimentalView')).toEqual({
      error: 'PROVIDER_ERROR',
      flagKey: 'experimentalView',
      reason: 'ERROR',
      value: false,
    });
  });

  it('notifies subscribers when a local override changes', () => {
    const provider = createLocalFeatureFlagProvider({ storage });
    const registry = createFeatureFlagRegistry(definitions, { provider });
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);

    provider.setOverride('defaultOnView', false);
    expect(listener).toHaveBeenCalledOnce();

    provider.resetOverride('defaultOnView');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    provider.setOverride('defaultOnView', false);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('returns an error evaluation for an unknown flag', () => {
    const registry = createFeatureFlagRegistry(definitions);

    expect(registry.evaluate('missing' as keyof typeof definitions)).toEqual({
      error: 'UNKNOWN_FLAG',
      flagKey: 'missing',
      reason: 'ERROR',
      value: false,
    });
  });

  it('unsubscribes from a provider when disposed', () => {
    const providerListener = vi.fn();
    const unsubscribe = vi.fn();
    const provider: FeatureFlagProvider = {
      name: 'subscribable-provider',
      evaluateBoolean: (flagKey, defaultValue) => ({
        flagKey,
        reason: 'PROVIDER',
        value: defaultValue,
      }),
      subscribe: (listener) => {
        providerListener.mockImplementation(listener);
        return unsubscribe;
      },
    };
    const registry = createFeatureFlagRegistry(definitions, { provider });
    const listener = vi.fn();
    registry.subscribe(listener);

    providerListener();
    expect(listener).toHaveBeenCalledOnce();

    registry.dispose();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe('useFeatureFlag', () => {
  it('updates when the configured provider changes', () => {
    const provider = createLocalFeatureFlagProvider({
      storage: new MemoryStorage(),
    });
    const registry = createFeatureFlagRegistry(definitions, { provider });
    const { result } = renderHook(() => useFeatureFlag(registry, 'experimentalView'));

    expect(result.current).toBe(false);

    act(() => provider.setOverride('experimentalView', true));

    expect(result.current).toBe(true);
  });
});
