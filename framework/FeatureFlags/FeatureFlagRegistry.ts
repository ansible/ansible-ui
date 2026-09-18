export type FeatureFlagStatus = 'proposed' | 'alpha' | 'beta' | 'production' | 'deprecated';

export type FeatureFlagKind = 'release' | 'experiment' | 'operational' | 'kill-switch';

export type FeatureFlagScope = 'client-only';

export interface FeatureFlagDefinition {
  readonly defaultValue: boolean;
  readonly description: string;
  readonly kind: FeatureFlagKind;
  readonly owner: string;
  readonly removalDate: string;
  readonly scope: FeatureFlagScope;
  readonly status: FeatureFlagStatus;
}

export type FeatureFlagDefinitions = Readonly<Record<string, FeatureFlagDefinition>>;

export type FeatureFlagKey<Definitions extends FeatureFlagDefinitions> = keyof Definitions & string;

export interface FeatureFlagEvaluationContext {
  readonly environment?: string;
  readonly targetingKey?: string;
}

export type FeatureFlagEvaluationReason = 'DEFAULT' | 'ERROR' | 'LOCAL_OVERRIDE' | 'PROVIDER';

export interface FeatureFlagEvaluation {
  readonly error?: string;
  readonly flagKey: string;
  readonly reason: FeatureFlagEvaluationReason;
  readonly value: boolean;
}

export interface FeatureFlagProvider {
  readonly name: string;
  evaluateBoolean(
    flagKey: string,
    defaultValue: boolean,
    context?: FeatureFlagEvaluationContext
  ): FeatureFlagEvaluation;
  subscribe?(listener: () => void): () => void;
}

export interface LocalFeatureFlagProvider extends FeatureFlagProvider {
  resetOverride(flagKey: string): void;
  setOverride(flagKey: string, enabled: boolean): void;
}

export interface FeatureFlagRegistry<Definitions extends FeatureFlagDefinitions> {
  readonly definitions: Definitions;
  dispose(): void;
  evaluate(flag: FeatureFlagKey<Definitions>): FeatureFlagEvaluation;
  isEnabled(flag: FeatureFlagKey<Definitions>): boolean;
  subscribe(listener: () => void): () => void;
}

export interface FeatureFlagRegistryOptions {
  readonly context?: FeatureFlagEvaluationContext;
  readonly provider?: FeatureFlagProvider;
}

export interface LocalFeatureFlagProviderOptions {
  readonly storage?: Storage;
  readonly storageKey?: string;
}

type StoredOverrides = Record<string, boolean>;

const defaultStorageKey = 'ui:feature-flags';

function hasOwnProperty(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function getDefaultStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isStoredOverrides(value: unknown): value is StoredOverrides {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === 'boolean');
}

function readOverrides(storage: Storage | undefined, storageKey: string): StoredOverrides {
  if (!storage) {
    return {};
  }

  try {
    const storedValue = storage.getItem(storageKey);
    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return isStoredOverrides(parsedValue) ? parsedValue : {};
  } catch {
    return {};
  }
}

function createDefaultFeatureFlagProvider(): FeatureFlagProvider {
  return {
    name: 'default',
    evaluateBoolean: (flagKey, defaultValue) => ({
      flagKey,
      reason: 'DEFAULT',
      value: defaultValue,
    }),
  };
}

export function createLocalFeatureFlagProvider(
  options: LocalFeatureFlagProviderOptions = {}
): LocalFeatureFlagProvider {
  const storage = options.storage ?? getDefaultStorage();
  const storageKey = options.storageKey ?? defaultStorageKey;
  const overrides = readOverrides(storage, storageKey);
  const listeners = new Set<() => void>();

  const persist = () => {
    if (!storage) {
      return;
    }

    try {
      storage.setItem(storageKey, JSON.stringify(overrides));
    } catch {
      // Storage can be unavailable or full. The in-memory value remains usable.
    }
  };

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    name: 'local-development',
    evaluateBoolean: (flagKey, defaultValue, context) => {
      void context;
      if (!hasOwnProperty(overrides, flagKey)) {
        return { flagKey, reason: 'DEFAULT', value: defaultValue };
      }
      return { flagKey, reason: 'LOCAL_OVERRIDE', value: overrides[flagKey] };
    },
    resetOverride: (flagKey) => {
      if (!hasOwnProperty(overrides, flagKey)) {
        return;
      }
      delete overrides[flagKey];
      persist();
      notify();
    },
    setOverride: (flagKey, enabled) => {
      if (overrides[flagKey] === enabled) {
        return;
      }
      overrides[flagKey] = enabled;
      persist();
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function createFeatureFlagRegistry<Definitions extends FeatureFlagDefinitions>(
  definitions: Definitions,
  options: FeatureFlagRegistryOptions = {}
): FeatureFlagRegistry<Definitions> {
  const provider = options.provider ?? createDefaultFeatureFlagProvider();
  const listeners = new Set<() => void>();
  const unsubscribeProvider = provider.subscribe?.(() => {
    for (const listener of listeners) {
      listener();
    }
  });

  const evaluate = (flag: FeatureFlagKey<Definitions>): FeatureFlagEvaluation => {
    const definition = definitions[flag];
    if (!definition) {
      return {
        error: 'UNKNOWN_FLAG',
        flagKey: flag,
        reason: 'ERROR',
        value: false,
      };
    }

    try {
      return provider.evaluateBoolean(flag, definition.defaultValue, options.context);
    } catch {
      return {
        error: 'PROVIDER_ERROR',
        flagKey: flag,
        reason: 'ERROR',
        value: definition.defaultValue,
      };
    }
  };

  return {
    definitions,
    dispose: () => {
      unsubscribeProvider?.();
      listeners.clear();
    },
    evaluate,
    isEnabled: (flag) => evaluate(flag).value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
