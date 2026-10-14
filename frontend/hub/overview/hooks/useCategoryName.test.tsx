import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCategoryName } from './useCategoryName';

describe('useCategoryName', () => {
  const t = (str: string) => str;

  it('returns mapped category labels', () => {
    const { result } = renderHook(() => useCategoryName('application', t));
    expect(result.current).toBe('Application collections');
  });

  it('returns the category key when unmapped', () => {
    const { result } = renderHook(() => useCategoryName('custom-category', t));
    expect(result.current).toBe('custom-category');
  });
});
