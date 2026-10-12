/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ITableColumn } from '@ansible/ansible-ui-framework';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from './ToolbarAsyncSelectFilterBuilder';

const setDialog = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [undefined, setDialog],
  };
});

describe('ToolbarAsyncSelectFilterBuilder', () => {
  const props: AsyncSelectFilterBuilderProps<{ name: string }> = {
    title: 'Pick item',
    tableColumns: [
      { header: 'Name', type: 'text', value: (item: { name: string }) => item.name },
    ] as ITableColumn<{ name: string }>[],
    viewParams: {
      url: '/api/items/',
      keyFn: (item: { name: string }) => item.name,
      tableColumns: [],
    },
    useView: () =>
      ({
        itemCount: 0,
        pageItems: [],
        refresh: vi.fn(),
      }) as unknown as ReturnType<AsyncSelectFilterBuilderProps<{ name: string }>['useView']>,
  };

  it('opens single select dialog', () => {
    const { result } = renderHook(() => useAsyncSingleSelectFilterBuilder(props));
    result.current.openBrowse(vi.fn(), { name: 'one' });
    expect(setDialog).toHaveBeenCalled();
  });

  it('opens multi select dialog', () => {
    const { result } = renderHook(() => useAsyncMultiSelectFilterBuilder(props));
    result.current.openBrowse(vi.fn(), [{ name: 'one' }]);
    expect(setDialog).toHaveBeenCalled();
  });
});
