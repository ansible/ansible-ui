/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useImagesFilters } from './useImagesFilters';

describe('useImagesFilters', () => {
  it('returns tag and digest filters', () => {
    const { result } = renderHook(() => useImagesFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(2);
    expect(result.current.map((filter) => filter.key)).toEqual(['tag', 'digest']);
    expect(result.current[1].query).toBe('digest__contains');
  });
});
