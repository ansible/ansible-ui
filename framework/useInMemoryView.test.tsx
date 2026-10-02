/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useInMemoryView } from './useInMemoryView';

interface TestItem {
  id: number;
  name: string;
  category: string;
}

const testItems: TestItem[] = [
  { id: 1, name: 'Charlie', category: 'fruit' },
  { id: 2, name: 'Alpha', category: 'vegetable' },
  { id: 3, name: 'Bravo', category: 'fruit' },
  { id: 4, name: 'Delta', category: 'vegetable' },
  { id: 5, name: 'Echo', category: 'fruit' },
];

function Wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useInMemoryView', () => {
  it('should return all items when no filters applied', () => {
    const { result } = renderHook(
      () =>
        useInMemoryView<TestItem>({
          items: testItems,
          keyFn: (item) => item.id,
          disableQueryString: true,
        }),
      { wrapper: Wrapper }
    );

    expect(result.current.itemCount).toBe(5);
    expect(result.current.pageItems).toHaveLength(5);
  });

  it('should return undefined when items is undefined', () => {
    const { result } = renderHook(
      () =>
        useInMemoryView<TestItem>({
          items: undefined,
          keyFn: (item) => item.id,
          disableQueryString: true,
        }),
      { wrapper: Wrapper }
    );

    expect(result.current.itemCount).toBeUndefined();
    expect(result.current.pageItems).toBeUndefined();
  });

  it('should expose error from options', () => {
    const error = new Error('Test error');
    const { result } = renderHook(
      () =>
        useInMemoryView<TestItem>({
          items: testItems,
          keyFn: (item) => item.id,
          error,
          disableQueryString: true,
        }),
      { wrapper: Wrapper }
    );

    expect(result.current.error).toBe(error);
  });

  it('should sort items by default sort column', () => {
    const { result } = renderHook(
      () =>
        useInMemoryView<TestItem>({
          items: testItems,
          keyFn: (item) => item.id,
          tableColumns: [{ header: 'Name', sort: 'name', cell: (i) => i.name }],
          disableQueryString: true,
        }),
      { wrapper: Wrapper }
    );

    expect(result.current.pageItems).toBeDefined();
    if (result.current.pageItems) {
      expect(result.current.pageItems[0].name).toBe('Alpha');
      expect(result.current.pageItems[4].name).toBe('Echo');
    }
  });

  it('should provide selection helpers', () => {
    const { result } = renderHook(
      () =>
        useInMemoryView<TestItem>({
          items: testItems,
          keyFn: (item) => item.id,
          disableQueryString: true,
        }),
      { wrapper: Wrapper }
    );

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.isSelected(testItems[0])).toBe(false);
  });
});
