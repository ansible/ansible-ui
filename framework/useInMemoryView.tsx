import getValue from 'get-value';
import { useEffect, useMemo } from 'react';
import { ITableColumn } from './PageTable/PageTable';
import { IToolbarFilter } from './PageTable/PageToolbar';
import {
  ISelected,
  useFiltered,
  usePaged,
  useSelectedInMemory,
  useSorted,
} from './PageTable/useTableItems';
import { IView, useView } from './useView';
import { compareUnknowns } from './utils/compare';

export type IInMemoryView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    error: Error | undefined;
  };

export function useInMemoryView<T extends object>(options: {
  items: T[] | undefined;
  tableColumns?: ITableColumn<T>[];
  toolbarFilters?: IToolbarFilter[];
  disableQueryString?: boolean;
  keyFn: (item: T) => string | number;
  error?: Error;
}): IInMemoryView<T> {
  const { items, keyFn, tableColumns, toolbarFilters, disableQueryString } = options;
  const view = useView(
    {
      sort: tableColumns && tableColumns.length ? tableColumns[0].sort : undefined,
    },
    disableQueryString
  );
  const { page, perPage, sort, sortDirection, filters } = view;

  const sorted = useSorted(items);
  const { setSort } = sorted;
  useEffect(
    () =>
      setSort({
        id: sort,
        sortFn: (l: T, r: T) => {
          const lv = getValue(l, sort) as unknown;
          const rv = getValue(r, sort) as unknown;
          return compareUnknowns(lv, rv);
        },
        direction: sortDirection,
      }),
    [sort, sortDirection, setSort]
  );

  const filtered = useFiltered(sorted.sorted, keyFn);
  const { setFilterFn } = filtered;
  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      setFilterFn(undefined);
    } else {
      setFilterFn((item: T) => {
        for (const key in filters) {
          const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
          if (toolbarFilter) {
            const value = getValue(item, toolbarFilter.query) as unknown;
            if (typeof value === 'string') {
              for (const filterValue of filters[key]) {
                if (value.toLowerCase().includes(filterValue.toLowerCase())) return true;
              }
            }
          }
        }
        return false;
      });
    }
  }, [filters, setFilterFn, toolbarFilters]);

  const paged = usePaged(filtered.filtered);
  const { setPage, setPerPage } = paged;
  useEffect(() => setPage(page), [page, paged, setPage]);
  useEffect(() => setPerPage(perPage), [perPage, paged, setPerPage]);

  const selection = useSelectedInMemory(items, keyFn);

  return useMemo(() => {
    return {
      itemCount: items ? filtered.filtered.length : undefined,
      pageItems: items ? paged.paged : undefined,
      error: options.error,
      ...view,
      ...selection,
    };
  }, [filtered.filtered.length, items, options.error, paged.paged, selection, view]);
}
