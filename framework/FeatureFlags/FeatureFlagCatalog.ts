import type { FeatureFlagDefinition, FeatureFlagProvider } from './FeatureFlagRegistry';

export interface FeatureFlagCatalogEntry extends Omit<FeatureFlagDefinition, 'defaultValue'> {
  readonly enabled: boolean;
  readonly name: string;
}

type FeatureFlagDefinitionsFromCatalog<Catalog extends readonly FeatureFlagCatalogEntry[]> = {
  readonly [Entry in Catalog[number] as Entry['name']]: Omit<Entry, 'name' | 'enabled'> & {
    readonly defaultValue: false;
  };
};

const featureFlagNamePattern = /^FEATURE_[A-Z0-9_]+_ENABLED$/;
const allowedCatalogFields = new Set(['name', 'enabled', 'description', 'owner', 'removalDate']);

function hasValidRemovalDate(removalDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(removalDate)) {
    return false;
  }

  const parsedDate = new Date(`${removalDate}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().startsWith(removalDate);
}

export function validateFeatureFlagCatalog(
  catalog: readonly FeatureFlagCatalogEntry[]
): asserts catalog is readonly FeatureFlagCatalogEntry[] {
  const names = new Set<string>();

  for (const flag of catalog) {
    if (Object.keys(flag).some((field) => !allowedCatalogFields.has(field))) {
      throw new Error(`Unexpected field in feature flag catalog: ${flag.name}`);
    }
    if (!featureFlagNamePattern.test(flag.name)) {
      throw new Error(`Invalid feature flag name: ${flag.name}`);
    }
    if (names.has(flag.name)) {
      throw new Error(`Duplicate feature flag name: ${flag.name}`);
    }
    if (typeof flag.enabled !== 'boolean') {
      throw new Error(`Invalid feature flag enabled value: ${flag.name}`);
    }
    if (!flag.description.trim() || !flag.owner.trim()) {
      throw new Error(`Feature flag requires a description and owner: ${flag.name}`);
    }
    if (!hasValidRemovalDate(flag.removalDate)) {
      throw new Error(`Invalid feature flag removal date: ${flag.name}`);
    }
    names.add(flag.name);
  }
}

export function createFeatureFlagDefinitions<
  const Catalog extends readonly FeatureFlagCatalogEntry[],
>(catalog: Catalog): FeatureFlagDefinitionsFromCatalog<Catalog> {
  validateFeatureFlagCatalog(catalog);

  return Object.fromEntries(
    catalog.map(({ name, description, owner, removalDate }) => [
      name,
      { defaultValue: false, description, owner, removalDate },
    ])
  ) as FeatureFlagDefinitionsFromCatalog<Catalog>;
}

export function createFeatureFlagConfigProvider(
  catalog: readonly FeatureFlagCatalogEntry[]
): FeatureFlagProvider {
  validateFeatureFlagCatalog(catalog);
  const configuredValues = new Map(catalog.map(({ name, enabled }) => [name, enabled] as const));

  return {
    name: 'source-controlled-config',
    evaluateBoolean: (flagKey, defaultValue) => {
      const enabled = configuredValues.get(flagKey);
      return {
        flagKey,
        reason: enabled === undefined ? 'DEFAULT' : 'PROVIDER',
        value: enabled ?? defaultValue,
      };
    },
  };
}
