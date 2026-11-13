import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { IFeatureFlag } from './IFeatureFlag';
import { useFeatureFlagColumns } from './useFeatureFlagColumns';

function renderColumnCell(column: ITableColumn<IFeatureFlag>, item: IFeatureFlag): ReactNode {
  if (!('cell' in column) || typeof column.cell !== 'function') {
    throw new Error('Expected a column with a cell renderer');
  }
  return column.cell(item);
}

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

  test('should render developer preview support labels and private name chips', () => {
    const { result } = renderHook(() => useFeatureFlagColumns({ isReadOnly: true }));
    const nameColumn = result.current.find((column) => column.id === 'name');
    const supportColumn = result.current.find((column) => column.id === 'support_level');
    const stateColumn = result.current.find((column) => column.id === 'state');
    const supportUrlColumn = result.current.find((column) => column.id === 'support_url');

    const hiddenFlag = createFlag({ visibility: false, support_level: 'DEVELOPER_PREVIEW' });

    const { container: nameCell } = render(
      <>{nameColumn && renderColumnCell(nameColumn, hiddenFlag)}</>
    );
    expect(nameCell).toHaveTextContent('Private');
    expect(nameCell).toHaveTextContent('Test flag');

    const { container: supportCell } = render(
      <>
        {supportColumn &&
          renderColumnCell(supportColumn, createFlag({ support_level: 'DEVELOPER_PREVIEW' }))}
      </>
    );
    expect(supportCell).toHaveTextContent('Developer preview');

    const enabledFlag = createFlag({ state: true });
    const { container: enabledCell } = render(
      <>{stateColumn && renderColumnCell(stateColumn, enabledFlag)}</>
    );
    expect(enabledCell).toHaveTextContent('Enabled');

    const { container: supportUrlCell } = render(
      <>
        {supportUrlColumn &&
          renderColumnCell(
            supportUrlColumn,
            createFlag({ support_url: 'https://example.com/support' })
          )}
      </>
    );
    expect(supportUrlCell).toHaveTextContent('Support');
  });
});
