import type { FeatureFlagDefinition } from './FeatureFlagRegistry';

export interface FeatureFlagCatalogEntry extends FeatureFlagDefinition {
  readonly name: string;
}

type FeatureFlagDefinitionsFromCatalog<Catalog extends readonly FeatureFlagCatalogEntry[]> = {
  readonly [Entry in Catalog[number] as Entry['name']]: Omit<Entry, 'name'>;
};

const featureFlagNamePattern = /^FEATURE_[A-Z0-9_]+_ENABLED$/;
const featureFlagKinds = new Set(['release', 'experiment', 'operational', 'kill-switch']);
const featureFlagStatuses = new Set(['proposed', 'alpha', 'beta', 'production', 'deprecated']);
const allowedCatalogFields = new Set([
  'name',
  'status',
  'defaultValue',
  'scope',
  'kind',
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
    if (flag.status === 'proposed' && flag.defaultValue) {
      throw new Error(`Proposed feature flag must default off: ${flag.name}`);
    }
    if (!featureFlagStatuses.has(flag.status)) {
      throw new Error(`Invalid feature flag status: ${flag.name}`);
    }
    if (!featureFlagKinds.has(flag.kind)) {
      throw new Error(`Invalid feature flag kind: ${flag.name}`);
    }
    if (flag.scope !== 'client-only') {
      throw new Error(`Invalid feature flag scope: ${flag.name}`);
    }
    if (typeof flag.defaultValue !== 'boolean') {
      throw new Error(`Invalid feature flag default: ${flag.name}`);
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
    catalog.map(({ name, ...definition }) => [name, definition])
  ) as FeatureFlagDefinitionsFromCatalog<Catalog>;
}
