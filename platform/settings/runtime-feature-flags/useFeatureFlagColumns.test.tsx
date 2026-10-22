import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { IFeatureFlag } from './IFeatureFlag';
import { useFeatureFlagColumns } from './useFeatureFlagColumns';

function createFlag(overrides: Partial<IFeatureFlag> = {}): IFeatureFlag {
  return {
    id: 1,
    url: '/api/gateway/v1/feature_flags/1/',
    related: {},
    summary_fields: {},
    name: 'FLAG',
    ui_name: 'Test flag',
    description: 'Description',
    state: false,
    visibility: true,
    support_level: 'GENERAL_AVAILABILITY',
    toggle_type: 'runtime',
    ...overrides,
  } as IFeatureFlag;
}

describe('useFeatureFlagColumns', () => {
  test('should expose name, description, and support level columns', () => {
    const { result } = renderHook(() => useFeatureFlagColumns());

    expect(result.current.map((column) => column.id)).toEqual([
      'name',
      'description',
      'support_level',
      'labels',
      'support_url',
    ]);
  });

  test('should map support level values for display', () => {
    const { result } = renderHook(() => useFeatureFlagColumns());
    const supportColumn = result.current.find((column) => column.id === 'support_level');
    const flag = createFlag({ support_level: 'TECHNOLOGY_PREVIEW' });

    expect(supportColumn?.value?.(flag)).toBe('Technology preview');
  });

  test('should include state column when table is read only', () => {
    const { result } = renderHook(() => useFeatureFlagColumns({ isReadOnly: true }));

    expect(result.current.map((column) => column.id)).toContain('state');
  });
});
