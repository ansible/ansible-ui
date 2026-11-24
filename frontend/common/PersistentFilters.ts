import { useEffect } from 'react';

const PERSISTENT_FILTER_KEY = 'persistent-filter';

interface IFilter {
  pageKey: string;
  qs: string;
}

export function usePersistentFilters(pageKey: string) {
  const search = window.location.search;
  useEffect(() => {
    const filter = {
      pageKey,
      qs: search,
    };
    sessionStorage.setItem(PERSISTENT_FILTER_KEY, JSON.stringify(filter));
  }, [pageKey, search]);
}

export function getPersistentFilters(key?: string) {
  const filterString = sessionStorage.getItem(PERSISTENT_FILTER_KEY);
  const filter = (filterString ? JSON.parse(filterString) : { qs: '' }) as IFilter;

  if (filter.pageKey === key) {
    return filter.qs;
  }
  return '';
}
