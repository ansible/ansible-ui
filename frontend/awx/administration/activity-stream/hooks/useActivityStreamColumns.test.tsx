import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useActivityStreamColumns } from './useActivityStreamColumns';

describe('useActivityStreamColumns', () => {
  test('returns activity stream table columns', () => {
    const { result } = renderHook(() => useActivityStreamColumns());

    expect(result.current.map((column) => column.header)).toEqual([
      'Time',
      'Initiated by',
      'Event',
    ]);
  });
});
