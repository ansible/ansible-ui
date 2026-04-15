import { useCallback, useRef, useState } from 'react';
import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IDashboardFilterSet } from '../types';

const PAGE_SIZE = 10;

export function useFilterSetView() {
  const [value, setValue] = useState<string | undefined>(undefined);
  const [version, setVersion] = useState(0);
  const [filterSets, setFilterSets] = useState<IDashboardFilterSet[]>([]);
  const [selectedFilterSet, setSelectedFilterSet] = useState<IDashboardFilterSet | undefined>(
    undefined
  );

  const getRequest = useGetRequest<AwxItemsResponse<IDashboardFilterSet>>();
  const getRequestRef = useRef(getRequest);
  getRequestRef.current = getRequest;

  const queryOptions = useCallback<PageAsyncSelectOptionsFn<string>>(async ({ next, search }) => {
    const page = next ? Number(next) : 1;
    const query: Record<string, string | number> = { page, page_size: PAGE_SIZE, order_by: 'name' };
    if (search) query['search'] = search;

    const data = await getRequestRef.current(metricsAPI`/dashboard_reports/filter_sets/`, query);

    const hasMore = data.results.length > 0 && !!data.next;
    const remaining = hasMore ? Math.max(0, data.count - page * PAGE_SIZE) : 0;
    const nextPage = hasMore ? String(page + 1) : '';

    const validResults = data.results.filter(
      (r): r is IDashboardFilterSet & { name: string } => !!r.name && r.id !== undefined
    );

    // Merge fetched results into local cache, avoiding duplicates
    setFilterSets((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const additions = validResults.filter((r) => !existingIds.has(r.id));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });

    return {
      remaining,
      options: validResults.map((r) => ({ label: r.name, value: String(r.id) })),
      next: nextPage,
    };
  }, []);

  const removeFilterSet = useCallback((filterSet: IDashboardFilterSet) => {
    setValue(undefined);
    setSelectedFilterSet(undefined);
    setFilterSets((prev) => prev.filter((fs) => fs.id !== filterSet.id));
    setVersion((v) => v + 1);
  }, []);

  const upsertFilterSet = useCallback((filterSet: IDashboardFilterSet) => {
    setFilterSets((prev) => {
      const exists = prev.some((fs) => fs.id === filterSet.id);
      return exists
        ? prev.map((fs) => (fs.id === filterSet.id ? filterSet : fs))
        : [...prev, filterSet];
    });
    setValue(String(filterSet.id));
    // Increment version to force PageAsyncSingleSelect remount and clear stale options cache
    setVersion((v) => v + 1);
  }, []);

  return {
    value,
    version,
    setValue,
    queryOptions,
    filterSets,
    selectedFilterSet,
    setSelectedFilterSet,
    removeFilterSet,
    upsertFilterSet,
  };
}
