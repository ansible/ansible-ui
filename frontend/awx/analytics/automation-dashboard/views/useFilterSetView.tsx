import { useCallback, useEffect, useRef, useState } from 'react';
import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IDashboardFilterSet } from '../types';
import { readPersistedFilterSet, writePersistedFilterSet } from '../utils/persistedFilterState';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';

const PAGE_SIZE = 10;

function isSameFilterSet(a: IDashboardFilterSet, b: IDashboardFilterSet): boolean {
  return (
    a.id === b.id && a.name === b.name && a.filters === b.filters && a.is_default === b.is_default
  );
}

export function useFilterSetView() {
  // Scope the persisted selection to the active user — sessionStorage survives
  // logout, so a second user on the same tab must not inherit the first user's
  // selected report.
  const { activeAwxUser } = useAwxActiveUser();
  const userId = activeAwxUser?.id;

  // Restore the selection this user made earlier in the session so switching to
  // another tab and back keeps the "Select report" dropdown on the same filter
  // set. The set is also seeded into the local cache so its label renders before
  // the async options list has loaded.
  const [persistedFilterSet] = useState(() =>
    userId !== undefined ? readPersistedFilterSet(userId) : undefined
  );

  const [value, setValue] = useState<string | undefined>(
    persistedFilterSet ? String(persistedFilterSet.id) : undefined
  );
  const [version, setVersion] = useState(0);
  const [filterSets, setFilterSets] = useState<IDashboardFilterSet[]>(
    persistedFilterSet ? [persistedFilterSet] : []
  );
  const [selectedFilterSet, setSelectedFilterSet] = useState<IDashboardFilterSet | undefined>(
    persistedFilterSet
  );

  // Which user the selection has been seeded for. Set up front when the id was
  // already known at mount.
  const [seededUserId, setSeededUserId] = useState<number | undefined>(userId);

  // Seed (or, when the active user changes mid-session, re-seed) the selection
  // from that user's persisted value.
  useEffect(() => {
    if (userId === undefined || seededUserId === userId) return;
    setSeededUserId(userId);
    const persisted = readPersistedFilterSet(userId);
    setValue(persisted ? String(persisted.id) : undefined);
    setSelectedFilterSet(persisted);
    setVersion((v) => v + 1);
    // Replace (not merge) the cache: the previous user's fetched report names and
    // filters JSON must not linger in the dropdown after a same-tab user switch.
    setFilterSets(persisted ? [persisted] : []);
  }, [userId, seededUserId]);

  // Persist the current selection for the active user (or clear it when deselected).
  useEffect(() => {
    if (userId === undefined || seededUserId !== userId) return;
    writePersistedFilterSet(selectedFilterSet, userId);
  }, [selectedFilterSet, userId, seededUserId]);

  const getRequest = useGetRequest<AwxItemsResponse<IDashboardFilterSet>>();
  const getRequestRef = useRef(getRequest);
  getRequestRef.current = getRequest;

  // Read inside the stable `queryOptions` callback without stale closures.
  const selectedFilterSetRef = useRef(selectedFilterSet);
  selectedFilterSetRef.current = selectedFilterSet;

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

    // Merge fetched results into the local cache: refresh entries we already have (a seeded
    // copy from sessionStorage can be stale — renamed or re-filtered server-side) and append
    // the rest.
    const fetchedById = new Map(validResults.map((r) => [r.id, r]));
    setFilterSets((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const refreshed = prev.map((fs) => {
        const fresh = fetchedById.get(fs.id);
        return fresh && !isSameFilterSet(fresh, fs) ? fresh : fs;
      });
      const additions = validResults.filter((r) => !existingIds.has(r.id));
      const changed = additions.length > 0 || refreshed.some((fs, i) => fs !== prev[i]);
      return changed ? [...refreshed, ...additions] : prev;
    });

    // Keep the active selection (and the filters it applies) in step with the server.
    const currentSelection = selectedFilterSetRef.current;
    if (currentSelection) {
      const fresh = fetchedById.get(currentSelection.id);
      if (fresh && !isSameFilterSet(fresh, currentSelection)) {
        setSelectedFilterSet(fresh);
      }
    }

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
