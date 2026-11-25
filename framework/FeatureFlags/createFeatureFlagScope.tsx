import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import type {
  FeatureFlagDefinitions,
  FeatureFlagKey,
  FeatureFlagRegistry,
} from './FeatureFlagRegistry';

interface FeatureFlagProviderProps<Definitions extends FeatureFlagDefinitions> {
  readonly children: ReactNode;
  readonly registry: FeatureFlagRegistry<Definitions>;
}

export function createFeatureFlagScope<Definitions extends FeatureFlagDefinitions>() {
  const context = createContext<FeatureFlagRegistry<Definitions> | undefined>(undefined);

  function FeatureFlagProvider({
    children,
    registry,
  }: Readonly<FeatureFlagProviderProps<Definitions>>) {
    return <context.Provider value={registry}>{children}</context.Provider>;
  }

  function useFeatureFlag(flag: FeatureFlagKey<Definitions>): boolean {
    const registry = useContext(context);
    if (!registry) {
      throw new Error('useFeatureFlag must be used inside FeatureFlagProvider');
    }

    return useSyncExternalStore(
      (listener) => registry.subscribe(listener),
      () => registry.isEnabled(flag),
      () => registry.isEnabled(flag)
    );
  }

  return { FeatureFlagProvider, useFeatureFlag };
}
