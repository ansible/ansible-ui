export interface FeatureFlagDefinition {
  readonly defaultValue: boolean;
  readonly description: string;
  readonly owner: string;
  readonly removalDate: string;
}

export type FeatureFlagDefinitions = Readonly<Record<string, FeatureFlagDefinition>>;

export type FeatureFlagKey<Definitions extends FeatureFlagDefinitions> = keyof Definitions & string;

export interface FeatureFlagRegistry<Definitions extends FeatureFlagDefinitions> {
  readonly definitions: Definitions;
  isEnabled(flag: FeatureFlagKey<Definitions>): boolean;
  setEnabled(flag: FeatureFlagKey<Definitions>, enabled: boolean): void;
  reset(flag: FeatureFlagKey<Definitions>): void;
  subscribe(listener: () => void): () => void;
}

export interface FeatureFlagRegistryOptions {
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

function readOverrides(
  storage: Storage | undefined,
  storageKey: string,
  definitions: FeatureFlagDefinitions
): StoredOverrides {
  if (!storage) {
    return {};
  }

  try {
    const storedValue = storage.getItem(storageKey);
    if (!storedValue) {
      return {};
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (!isStoredOverrides(parsedValue)) {
      return {};
    }

    const knownOverrides: StoredOverrides = {};
    for (const [flag, enabled] of Object.entries(parsedValue)) {
      if (hasOwnProperty(definitions, flag)) {
        knownOverrides[flag] = enabled;
      }
    }
    return knownOverrides;
  } catch {
    return {};
  }
}

export function createFeatureFlagRegistry<Definitions extends FeatureFlagDefinitions>(
  definitions: Definitions,
  options: FeatureFlagRegistryOptions = {}
): FeatureFlagRegistry<Definitions> {
  const storage = options.storage ?? getDefaultStorage();
  const storageKey = options.storageKey ?? defaultStorageKey;
  const overrides = readOverrides(storage, storageKey, definitions);
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
    definitions,
    isEnabled: (flag) => {
      const definition = definitions[flag];
      if (!definition) {
        return false;
      }
      return overrides[flag] ?? definition.defaultValue;
    },
    setEnabled: (flag, enabled) => {
      if (!hasOwnProperty(definitions, flag) || overrides[flag] === enabled) {
        return;
      }
      overrides[flag] = enabled;
      persist();
      notify();
    },
    reset: (flag) => {
      if (!hasOwnProperty(overrides, flag)) {
        return;
      }
      delete overrides[flag];
      persist();
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
