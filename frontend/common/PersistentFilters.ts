import { useEffect, useState } from 'react';

const PERSISTENT_FILTER_KEY = 'persistent-filter';

interface IFilter {
  pageKey: string;
  qs: string;
}

export function usePersistentFilters(pageKey: string) {
  const [search, setSearch] = useState(window.location.search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (window.location.search !== search) {
      setSearch(window.location.search);
    }
  });

  useEffect(() => {
    const filter = {
      pageKey,
      qs: window.location.search,
    };
    sessionStorage.setItem(PERSISTENT_FILTER_KEY, JSON.stringify(filter));
  }, [search, pageKey]);
}

export function getPersistentFilters(key?: string) {
  const filterString = sessionStorage.getItem(PERSISTENT_FILTER_KEY);
  const filter = (filterString ? JSON.parse(filterString) : { qs: '' }) as IFilter;

  if (filter.pageKey === key) {
    return filter.qs;
  }
  return '';
}
