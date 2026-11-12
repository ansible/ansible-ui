/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useRepositoryDistributionFilters } from './useRepositoryDistributionFilters';

describe('useRepositoryDistributionFilters', () => {
  it('returns name and base path filters', () => {
    const { result } = renderHook(() => useRepositoryDistributionFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(2);
    expect(result.current[0].key).toBe('name');
    expect(result.current[0].label).toBe('Name');
    expect(result.current[1].key).toBe('base_path');
    expect(result.current[1].label).toBe('Base path');
  });
});
