import type {
  FeatureFlagDefinition,
  FeatureFlagKind,
  FeatureFlagProvider,
  FeatureFlagStatus,
} from './FeatureFlagRegistry';

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
const featureFlagStatuses = new Set<FeatureFlagStatus>([
  'proposed',
  'alpha',
  'beta',
  'production',
  'deprecated',
]);
const featureFlagKinds = new Set<FeatureFlagKind>([
  'release',
  'experiment',
  'operational',
  'kill-switch',
]);
const allowedCatalogFields = new Set([
  'name',
  'status',
  'kind',
  'scope',
  'enabled',
  'description',
  'owner',
  'removalDate',
]);

function hasValidRemovalDate(removalDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(removalDate)) {
    return false;
  }

  const parsedDate = new Date(`${removalDate}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().startsWith(removalDate);
}

function validateFeatureFlagName(flag: FeatureFlagCatalogEntry, names: Set<string>): void {
  if (!featureFlagNamePattern.test(flag.name)) {
    throw new Error(`Invalid feature flag name: ${flag.name}`);
  }
  if (names.has(flag.name)) {
    throw new Error(`Duplicate feature flag name: ${flag.name}`);
  }
  names.add(flag.name);
}

function validateFeatureFlagMetadata(flag: FeatureFlagCatalogEntry): void {
  if (!featureFlagStatuses.has(flag.status)) {
    throw new Error(`Invalid feature flag status: ${flag.name}`);
  }
  if (!featureFlagKinds.has(flag.kind)) {
    throw new Error(`Invalid feature flag kind: ${flag.name}`);
  }
  if (flag.scope !== 'client-only') {
    throw new Error(`Invalid feature flag scope: ${flag.name}`);
  }
  if (typeof flag.enabled !== 'boolean') {
    throw new TypeError(`Invalid feature flag enabled value: ${flag.name}`);
  }
  if ((flag.status === 'proposed' || flag.status === 'deprecated') && flag.enabled) {
    throw new Error(`Proposed or deprecated feature flags must be disabled: ${flag.name}`);
  }
  if (!flag.description.trim() || !flag.owner.trim()) {
    throw new Error(`Feature flag requires a description and owner: ${flag.name}`);
  }
  if (!hasValidRemovalDate(flag.removalDate)) {
    throw new Error(`Invalid feature flag removal date: ${flag.name}`);
  }
}

function validateFeatureFlagCatalogEntry(flag: FeatureFlagCatalogEntry, names: Set<string>): void {
  if (Object.keys(flag).some((field) => !allowedCatalogFields.has(field))) {
    throw new Error(`Unexpected field in feature flag catalog: ${flag.name}`);
  }
  validateFeatureFlagName(flag, names);
  validateFeatureFlagMetadata(flag);
}

export function validateFeatureFlagCatalog(
  catalog: readonly FeatureFlagCatalogEntry[]
): asserts catalog is readonly FeatureFlagCatalogEntry[] {
  const names = new Set<string>();

  for (const flag of catalog) {
    validateFeatureFlagCatalogEntry(flag, names);
  }
}

export function createFeatureFlagDefinitions<
  const Catalog extends readonly FeatureFlagCatalogEntry[],
>(catalog: Catalog): FeatureFlagDefinitionsFromCatalog<Catalog> {
  validateFeatureFlagCatalog(catalog);

  return Object.fromEntries(
    catalog.map(({ name, description, kind, owner, removalDate, scope, status }) => [
      name,
      { defaultValue: false, description, kind, owner, removalDate, scope, status },
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
