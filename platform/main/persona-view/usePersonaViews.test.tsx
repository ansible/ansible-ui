import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { usePersonaViews } from './usePersonaViews';

describe('usePersonaViews', () => {
  test('returns administration and operator persona definitions', () => {
    const { result } = renderHook(() => usePersonaViews());

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toMatchObject({
      id: 'administration',
      name: 'Administration View',
    });
    expect(result.current[1]).toMatchObject({
      id: 'operator',
      name: 'Operator View',
    });
    expect(result.current[0].description).toContain('automation platform');
    expect(result.current[1].description).toContain('executing automation');
  });
});
