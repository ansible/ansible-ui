import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { getPersistentFilters, usePersistentFilters } from './PersistentFilters';

describe('PersistentFilters', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('should persist current search to session storage', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '?name=test' },
      configurable: true,
    });

    renderHook(() => usePersistentFilters('templates'));

    const stored = JSON.parse(sessionStorage.getItem('persistent-filter') ?? '{}') as {
      pageKey: string;
      qs: string;
    };
    expect(stored.pageKey).toBe('templates');
    expect(stored.qs).toBe('?name=test');
  });

  it('should return stored query string for matching page key', () => {
    sessionStorage.setItem(
      'persistent-filter',
      JSON.stringify({ pageKey: 'jobs', qs: '?status=running' })
    );

    expect(getPersistentFilters('jobs')).toBe('?status=running');
    expect(getPersistentFilters('other')).toBe('');
  });
});
