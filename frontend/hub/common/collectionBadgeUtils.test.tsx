/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { getCollectionBadge } from './collectionBadgeUtils';

const t = (key: string) => key;

describe('getCollectionBadge', () => {
  it('should return Certified badge for "rh-certified" repository in standalone mode', () => {
    const badge = getCollectionBadge('rh-certified', t);
    expect(badge.label).toBe('Certified');
    expect(badge.color).toBe('blue');
    expect(badge.variant).toBe('filled');
    expect(badge.icon).toBeDefined();
  });

  it('should return raw name for "published" repository in standalone mode', () => {
    const badge = getCollectionBadge('published', t);
    expect(badge.label).toBe('published');
    expect(badge.color).toBe('grey');
    expect(badge.variant).toBe('filled');
  });

  it('should return Validated badge for "validated" repository', () => {
    const badge = getCollectionBadge('validated', t);
    expect(badge.label).toBe('Validated');
    expect(badge.color).toBe('purple');
    expect(badge.variant).toBe('filled');
    expect(badge.icon).toBeUndefined();
  });

  it('should return raw name with grey color for unknown repository', () => {
    const badge = getCollectionBadge('community', t);
    expect(badge.label).toBe('community');
    expect(badge.color).toBe('grey');
    expect(badge.variant).toBe('filled');
  });

  it('should return empty label for undefined repository', () => {
    const badge = getCollectionBadge(undefined, t);
    expect(badge.label).toBe('');
    expect(badge.color).toBe('grey');
    expect(badge.variant).toBe('filled');
  });
});
