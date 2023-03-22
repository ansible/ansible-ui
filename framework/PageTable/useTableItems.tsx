import debounce from 'debounce';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useTableItems<T extends object>(
  items: T[],
  keyFn: (item: T) => string | number,
  defaults?: { search?: string | null }
) {
  const {
    selectedItems,
    selectItem,
    unselectItem,
    isSelected,
    selectItems,
    unselectAll,
    allSelected,
  } = useSelected(items, keyFn);
  const { sorted, sort, setSort } = useSorted(items);
  const { filtered, setFilterFn } = useFiltered(sorted, keyFn);
  const { searched, search, setSearch, setSearchFn } = useSearched(
    filtered,
    keyFn,
    defaults?.search
  );
  const { paged, page, setPage, perPage, setPerPage } = usePaged(searched);
  const selectPage = useCallback(() => selectItems(paged), [paged, selectItems]);
  const selectAll = useCallback(() => selectItems(searched), [searched, selectItems]);
  return useMemo(
    () => ({
      allSelected,
      filtered,
      isSelected,
      page,
      paged,
      perPage,
      search,
      searched,
      selectAll,
      selectItem,
      selectPage,
      selectedItems,
      setFilterFn,
      setPage,
      setPerPage,
      setSearch,
      setSearchFn,
      setSort,
      sort,
      sorted,
      unselectAll,
      unselectItem,
    }),
    [
      allSelected,
      filtered,
      isSelected,
      page,
      paged,
      perPage,
      search,
      searched,
      selectAll,
      selectItem,
      selectPage,
      selectedItems,
      setFilterFn,
      setPage,
      setPerPage,
      setSearch,
      setSearchFn,
      setSort,
      sort,
      sorted,
      unselectAll,
      unselectItem,
    ]
  );
}

export interface ISelected<T extends object> {
  selectedItems: T[];
  selectItem: (item: T) => void;
  selectItems: (items: T[]) => void;
  unselectItem: (item: T) => void;
  unselectItems: (items: T[]) => void;
  isSelected: (item: T) => boolean;
  selectAll: () => void;
  unselectAll: () => void;
  allSelected: boolean;
  keyFn: (item: T) => string | number;
}

/** Hook to track selection from a list of items. */
export function useSelected<T extends object>(
  /** The items in which selections are being tracked. Used to update the selected items when an item changes.  */
  items: T[],

  /** A function that returns a unique key for each item, used to track selection. */
  keyFn: (item: T) => string | number,

  /** The default items that should be initially selected. */
  defaultSelection?: T[]
): ISelected<T> {
  const [selectedMap, setSelectedMap] = useState<Record<string | number, T>>(() => {
    if (defaultSelection) {
      return defaultSelection.reduce<Record<string | number, T>>((selectedMap, item) => {
        selectedMap[keyFn(item)] = item;
        return selectedMap;
      }, {});
    } else {
      return {};
    }
  });

  useEffect(() => {
    setSelectedMap((selectedMap) => {
      let changed = false;
      items.forEach((item) => {
        const key = keyFn(item);
        if (selectedMap[key] && selectedMap[key] !== item) {
          changed = true;
          selectedMap[key] = item;
        }
      });
      return changed ? { ...selectedMap } : selectedMap;
    });
  }, [items, keyFn]);

  const selectItem = useCallback(
    (item: T) => {
      setSelectedMap((selectedMap) => {
        const itemKey = keyFn(item);
        const existing = selectedMap[itemKey];
        if (existing !== item) {
          selectedMap = { ...selectedMap };
          selectedMap[itemKey] = item;
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const unselectItem = useCallback(
    (item: T) => {
      setSelectedMap((selectedMap) => {
        const itemKey = keyFn(item);
        const existing = selectedMap[itemKey];
        if (existing) {
          selectedMap = { ...selectedMap };
          delete selectedMap[itemKey];
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const isSelected = useCallback(
    (item: T) => {
      const itemKey = keyFn(item);
      return selectedMap[itemKey] !== undefined;
    },
    [keyFn, selectedMap]
  );

  const selectItems = useCallback(
    (items: T[]) => {
      setSelectedMap((selectedMap) => {
        selectedMap = { ...selectedMap };
        for (const item of items) {
          const itemKey = keyFn(item);
          selectedMap[itemKey] = item;
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const selectAll = useCallback(() => selectItems(items), [items, selectItems]);

  const unselectItems = useCallback(
    (items: T[]) => {
      for (const item of items) {
        unselectItem(item);
      }
    },
    [unselectItem]
  );

  const unselectAll = useCallback(() => {
    setSelectedMap((selectedMap) => {
      if (Object.keys(selectedMap).length > 0) {
        return {};
      }
      return selectedMap;
    });
  }, []);

  const selectedItems = useMemo(() => Object.values(selectedMap), [selectedMap]);
  const allSelected = useMemo(
    () => selectedItems.length === items.length,
    [items.length, selectedItems.length]
  );

  return useMemo(
    () => ({
      selectedItems,
      selectItem,
      unselectItem,
      isSelected,
      selectItems,
      selectAll,
      unselectAll,
      allSelected,
      keyFn,
      unselectItems,
    }),
    [
      allSelected,
      isSelected,
      keyFn,
      selectAll,
      selectItem,
      selectItems,
      selectedItems,
      unselectAll,
      unselectItem,
      unselectItems,
    ]
  );
}

export function useSelectedInMemory<T extends object>(
  items: T[] | undefined,
  keyFn: (item: T) => string | number
) {
  const [selectedMap, setSelectedMap] = useState<Record<string | number, T>>({});

  useEffect(() => {
    setSelectedMap((selectedMap) => {
      let changed = false;

      const itemsKeys = !items
        ? {}
        : items.reduce((itemsKeys, item) => {
            const key = keyFn(item);
            itemsKeys[key] = item;
            if (selectedMap[key] && selectedMap[key] !== item) {
              changed = true;
              selectedMap[key] = item;
            }
            return itemsKeys;
          }, {} as Record<string | number, T>);

      const removeKeyMap: Record<string | number, true> = {};
      for (const key in selectedMap) {
        if (!itemsKeys[key]) {
          removeKeyMap[key] = true;
        }
      }

      const removeKeys = Object.keys(removeKeyMap);
      if (removeKeys.length) {
        changed = true;
        for (const key of removeKeys) {
          delete selectedMap[key];
        }
      }

      return changed ? { ...selectedMap } : selectedMap;
    });
  }, [items, keyFn]);

  const selectItem = useCallback(
    (item: T) => {
      setSelectedMap((selectedMap) => {
        const itemKey = keyFn(item);
        const existing = selectedMap[itemKey];
        if (existing !== item) {
          selectedMap = { ...selectedMap };
          selectedMap[itemKey] = item;
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const unselectItem = useCallback(
    (item: T) => {
      setSelectedMap((selectedMap) => {
        const itemKey = keyFn(item);
        const existing = selectedMap[itemKey];
        if (existing) {
          selectedMap = { ...selectedMap };
          delete selectedMap[itemKey];
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const unselectItems = useCallback(
    (items: T[]) => {
      for (const item of items) {
        unselectItem(item);
      }
    },
    [unselectItem]
  );

  const isSelected = useCallback(
    (item: T) => {
      const itemKey = keyFn(item);
      return selectedMap[itemKey] !== undefined;
    },
    [keyFn, selectedMap]
  );

  const selectItems = useCallback(
    (items: T[]) => {
      setSelectedMap((selectedMap) => {
        selectedMap = { ...selectedMap };
        for (const item of items) {
          const itemKey = keyFn(item);
          selectedMap[itemKey] = item;
        }
        return selectedMap;
      });
    },
    [keyFn]
  );

  const selectAll = useCallback(() => {
    selectItems(items ?? []);
  }, [items, selectItems]);

  const unselectAll = useCallback(() => {
    setSelectedMap((selectedMap) => {
      if (Object.keys(selectedMap).length > 0) {
        return {};
      }
      return selectedMap;
    });
  }, []);

  const selectedItems = useMemo(() => Object.values(selectedMap), [selectedMap]);
  const allSelected = useMemo(
    () => selectedItems.length === items?.length ?? 0,
    [items, selectedItems.length]
  );

  return useMemo(
    () => ({
      selectedItems,
      selectItem,
      unselectItem,
      isSelected,
      selectItems,
      selectAll,
      unselectAll,
      allSelected,
      keyFn,
      unselectItems,
    }),
    [
      allSelected,
      isSelected,
      keyFn,
      selectAll,
      selectItem,
      selectItems,
      selectedItems,
      unselectAll,
      unselectItem,
      unselectItems,
    ]
  );
}

export interface ISort<T extends object> {
  id: string;
  sortFn: (l: T, r: T) => number;
  direction: 'asc' | 'desc';
}
export function useSorted<T extends object>(items: T[] | undefined) {
  const [sort, setSort] = useState<ISort<T>>();

  const { direction, sortFn } = sort ?? {};

  const sorted = useMemo(() => {
    if (!items) return [];
    if (sortFn) {
      if (direction === 'asc') {
        return [...items.sort(sortFn)];
      } else {
        return [...items.sort(sortFn).reverse()];
      }
    } else {
      return items;
    }
  }, [direction, items, sortFn]);

  return useMemo(() => ({ sorted, sort, setSort }), [sort, sorted]);
}

export function useFiltered<T extends object>(items: T[], keyFn: (item: T) => string | number) {
  const filterMapRef = useRef<{ map: Record<string | number, { item: T; passes: boolean }> }>({
    map: {},
  });
  const [filterFn, setFilterFnState] = useState<(item: T) => boolean>();
  const setFilterFn = useCallback(
    (filterFn: ((item: T) => boolean) | undefined) => setFilterFnState(() => filterFn),
    []
  );
  const [filtered, setFiltered] = useState<T[]>([]);

  useEffect(() => {
    filterMapRef.current.map = {};
  }, [filterFn]);

  const cachedFilterFn = useCallback(
    (item: T) => {
      const key = keyFn(item);
      let cached = filterMapRef.current.map[key];
      if (!cached) {
        cached = { item, passes: filterFn ? filterFn(item) : true };
        filterMapRef.current.map[key] = cached;
      } else if (cached.item !== item) {
        cached.item = item;
        cached.passes = filterFn ? filterFn(item) : true;
      }
      return cached.passes;
    },
    [filterFn, keyFn]
  );

  useEffect(() => {
    if (filterFn) {
      setFiltered(items.filter(cachedFilterFn));
    } else {
      setFiltered(items);
    }
  }, [items, filterFn, cachedFilterFn]);

  return useMemo(
    function memoFiltered() {
      return { filtered, setFilterFn };
    },
    [filtered, setFilterFn]
  );
}

function useSearched<T extends object>(
  items: T[],
  keyFn: (item: T) => string | number,
  defaultSearch?: string | null
) {
  const searchMapRef = useRef<{ map: Record<string | number, { item: T; score: number }> }>({
    map: {},
  });
  const [searchFn, setSearchFnState] = useState<(item: T, search: string) => number>();
  const setSearchFn = useCallback(
    (searchFn: (item: T, search: string) => number) => setSearchFnState(() => searchFn),
    []
  );
  const [searched, setSearched] = useState<T[]>([]);
  const [search, setSearchState] = useState(defaultSearch ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSearch = useCallback(
    debounce((search: string) => setSearchState(search), 200),
    []
  );

  useEffect(() => {
    searchMapRef.current.map = {};
  }, [search, searchFn]);

  const cachedSearchFn = useCallback(
    (item: T) => {
      const key = keyFn(item);
      let cached = searchMapRef.current.map[key];
      if (!cached) {
        cached = { item, score: searchFn ? searchFn(item, search) : 0 };
        searchMapRef.current.map[key] = cached;
      } else if (cached.item !== item) {
        cached.item = item;
        cached.score = searchFn ? searchFn(item, search) : 0;
      }
      return cached;
    },
    [keyFn, searchFn, search]
  );

  useEffect(() => {
    if (searchFn && search) {
      setSearched(
        items
          .map(cachedSearchFn)
          .filter((cached) => cached.score < 0.5)
          .sort((l, r) => l.score - r.score)
          .map((cached) => cached.item)
      );
    } else {
      setSearched(items);
    }
  }, [search, items, searchFn, cachedSearchFn]);

  return useMemo(
    function memoFiltered() {
      return { searched, search, setSearch, setSearchFn };
    },
    [searched, search, setSearch, setSearchFn]
  );
}

export function usePaged<T extends object>(source: T[]) {
  const [paged, setPaged] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  useEffect(() => {
    setPaged((paged) => {
      const newPaged = source.slice((page - 1) * perPage, page * perPage);
      if (paged.length !== newPaged.length) {
        return newPaged;
      }
      let index = 0;
      for (const item of newPaged) {
        if (paged[index++] !== item) {
          return newPaged;
        }
      }
      return paged;
    });
  }, [page, perPage, source]);
  useEffect(() => {
    if (page > Math.ceil(source.length / perPage)) {
      setPage(1);
    }
  }, [page, perPage, source.length]);

  return useMemo(() => ({ paged, page, setPage, perPage, setPerPage }), [page, paged, perPage]);
}
