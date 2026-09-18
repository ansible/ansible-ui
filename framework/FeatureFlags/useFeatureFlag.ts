import { useCallback, useSyncExternalStore } from 'react';
import type {
  FeatureFlagDefinitions,
  FeatureFlagKey,
  FeatureFlagRegistry,
} from './FeatureFlagRegistry';

export function useFeatureFlag<Definitions extends FeatureFlagDefinitions>(
  registry: FeatureFlagRegistry<Definitions>,
  flag: FeatureFlagKey<Definitions>
): boolean {
  const subscribe = useCallback((listener: () => void) => registry.subscribe(listener), [registry]);
  const getSnapshot = useCallback(() => registry.isEnabled(flag), [flag, registry]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
