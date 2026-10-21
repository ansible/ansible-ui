import featureFlagsDocument from '../../docs/dev/feature-flags.json';
import { describe, expect, it } from 'vitest';
import {
  createFeatureFlagConfigProvider,
  createFeatureFlagDefinitions,
  validateFeatureFlagCatalog,
  type FeatureFlagCatalogEntry,
} from './FeatureFlagCatalog';

const catalog = featureFlagsDocument.flags as FeatureFlagCatalogEntry[];

describe('feature flag catalog', () => {
  it('keeps the JSON config valid and creates safe registry definitions', () => {
    expect(() => validateFeatureFlagCatalog(catalog)).not.toThrow();
    expect(createFeatureFlagDefinitions(catalog)).toEqual({
      FEATURE_EXAMPLE_VIEW_ENABLED: {
        defaultValue: false,
        description: 'Example of an unfinished client-only view.',
        owner: 'UI platform team',
        removalDate: '2026-12-31',
      },
    });
  });

  it('uses the JSON enabled value as the flag provider value', () => {
    const enabledCatalog = [{ ...catalog[0], enabled: true }];
    const provider = createFeatureFlagConfigProvider(enabledCatalog);

    expect(provider.evaluateBoolean(catalog[0].name, false)).toEqual({
      flagKey: catalog[0].name,
      reason: 'PROVIDER',
      value: true,
    });
  });

  it('rejects duplicate names and unexpected fields', () => {
    const invalidCatalog = [
      {
        ...catalog[0],
        extra: true,
      },
      catalog[0],
    ] as unknown as FeatureFlagCatalogEntry[];

    expect(() => validateFeatureFlagCatalog(invalidCatalog)).toThrow(
      'Unexpected field in feature flag catalog'
    );
  });

  it('throws a type error for a non-boolean enabled value', () => {
    const invalidCatalog = [
      { ...catalog[0], enabled: 'true' },
    ] as unknown as FeatureFlagCatalogEntry[];

    expect(() => validateFeatureFlagCatalog(invalidCatalog)).toThrow(TypeError);
  });

  it.each([
    [{ ...catalog[0], name: 'invalid-name' }, 'Invalid feature flag name'],
    [[catalog[0], catalog[0]], 'Duplicate feature flag name'],
    [{ ...catalog[0], enabled: 'true' }, 'Invalid feature flag enabled value'],
    [{ ...catalog[0], description: ' ' }, 'Feature flag requires a description and owner'],
    [{ ...catalog[0], owner: ' ' }, 'Feature flag requires a description and owner'],
    [{ ...catalog[0], removalDate: '12/31/2026' }, 'Invalid feature flag removal date'],
    [{ ...catalog[0], removalDate: '2026-02-30' }, 'Invalid feature flag removal date'],
  ])('rejects invalid catalog entries', (entry, message) => {
    const invalidCatalog = Array.isArray(entry) ? entry : [entry];

    expect(() => validateFeatureFlagCatalog(invalidCatalog as FeatureFlagCatalogEntry[])).toThrow(
      message
    );
  });
});
