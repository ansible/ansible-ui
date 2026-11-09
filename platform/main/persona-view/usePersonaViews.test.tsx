import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { usePersonaViews } from './usePersonaViews';

describe('usePersonaViews', () => {
  test('should return administration and operator views', () => {
    const { result } = renderHook(() => usePersonaViews());

    expect(result.current.map((view) => view.id)).toEqual(['administration', 'operator']);
    expect(result.current[0].name).toBe('Administration View');
    expect(result.current[1].name).toBe('Operator View');
  });
});
