import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeatureFlagRegistry } from './FeatureFlagRegistry';
import type { FeatureFlagDefinitions } from './FeatureFlagRegistry';
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
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    status: 'proposed',
  },
  defaultOnView: {
    defaultValue: true,
    description: 'Example default-on view.',
    owner: 'UI platform team',
    removalDate: '2026-12-31',
    status: 'production',
  },
} satisfies FeatureFlagDefinitions;

describe('createFeatureFlagRegistry', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it('uses definition defaults and fails closed for malformed persisted data', () => {
    storage.setItem('test-flags', '{not-json');
    const registry = createFeatureFlagRegistry(definitions, {
      storage,
      storageKey: 'test-flags',
    });

    expect(registry.isEnabled('experimentalView')).toBe(false);
    expect(registry.isEnabled('defaultOnView')).toBe(true);
  });

  it('persists known overrides and ignores unknown flags', () => {
    const registry = createFeatureFlagRegistry(definitions, {
      storage,
      storageKey: 'test-flags',
    });

    registry.setEnabled('experimentalView', true);
    storage.setItem('test-flags', '{"experimentalView":true,"unknown":true}');
    const restoredRegistry = createFeatureFlagRegistry(definitions, {
      storage,
      storageKey: 'test-flags',
    });

    expect(restoredRegistry.isEnabled('experimentalView')).toBe(true);
    expect(restoredRegistry.isEnabled('defaultOnView')).toBe(true);
  });

  it('resets an override to the definition default and notifies subscribers', () => {
    const registry = createFeatureFlagRegistry(definitions, { storage });
    const listener = vi.fn();
    const unsubscribe = registry.subscribe(listener);

    registry.setEnabled('defaultOnView', false);
    expect(registry.isEnabled('defaultOnView')).toBe(false);
    expect(listener).toHaveBeenCalledOnce();

    registry.reset('defaultOnView');
    expect(registry.isEnabled('defaultOnView')).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    registry.setEnabled('defaultOnView', false);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('useFeatureFlag', () => {
  it('updates when the registry changes', () => {
    const registry = createFeatureFlagRegistry(definitions, {
      storage: new MemoryStorage(),
    });
    const { result } = renderHook(() => useFeatureFlag(registry, 'experimentalView'));

    expect(result.current).toBe(false);

    act(() => registry.setEnabled('experimentalView', true));

    expect(result.current).toBe(true);
  });
});
