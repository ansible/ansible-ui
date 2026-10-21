import featureFlagsDocument from '../../docs/dev/feature-flags.json';
import { describe, expect, it } from 'vitest';
import {
  createFeatureFlagDefinitions,
  validateFeatureFlagCatalog,
  type FeatureFlagCatalogEntry,
} from './FeatureFlagCatalog';

const catalog = featureFlagsDocument.flags as FeatureFlagCatalogEntry[];

describe('feature flag catalog', () => {
  it('keeps the documented catalog valid and usable as registry definitions', () => {
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

  it('rejects duplicate names, invalid lifecycle data, and unexpected fields', () => {
    const invalidCatalog = [
      {
        ...catalog[0],
        defaultValue: true,
        extra: true,
      },
      catalog[0],
    ] as unknown as FeatureFlagCatalogEntry[];

    expect(() => validateFeatureFlagCatalog(invalidCatalog)).toThrow(
      'Unexpected field in feature flag catalog'
    );
  });

  it.each([
    [{ ...catalog[0], name: 'invalid-name' }, 'Invalid feature flag name'],
    [[catalog[0], catalog[0]], 'Duplicate feature flag name'],
    [{ ...catalog[0], defaultValue: true }, 'Feature flag must default off'],
    [{ ...catalog[0], defaultValue: 'true' }, 'Invalid feature flag default'],
    [{ ...catalog[0], description: ' ' }, 'Feature flag requires a description and owner'],
    [{ ...catalog[0], owner: ' ' }, 'Feature flag requires a description and owner'],
    [{ ...catalog[0], removalDate: '2026-02-30' }, 'Invalid feature flag removal date'],
  ])('rejects invalid catalog entries', (entry, message) => {
    const invalidCatalog = Array.isArray(entry) ? entry : [entry];

    expect(() => validateFeatureFlagCatalog(invalidCatalog as FeatureFlagCatalogEntry[])).toThrow(
      message
    );
  });
});
