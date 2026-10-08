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
      'example-view': {
        defaultValue: false,
        description: 'Example of an unfinished client-only view.',
        kind: 'release',
        owner: 'UI platform team',
        removalDate: '2026-12-31',
        scope: 'client-only',
        status: 'proposed',
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
});
