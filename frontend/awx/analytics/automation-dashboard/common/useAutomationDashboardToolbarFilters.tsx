import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { PageAsyncSelectQueryResult } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { AsyncKeyOptions, AutomationDashboardToolbarFiltersProps } from '../types';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { metricsAPI } from '../../../common/api/metrics-utils';
import {
  AutomationDashboardAsyncFilter,
  AutomationDashboardAsyncQueryOptions,
} from './useAutomationDashboardAsyncOptions';

const FILTER_KEYS: Record<string, AsyncKeyOptions> = {
  label: {
    apiPath: 'dashboard_reports/labels',
    labelKey: 'name',
    valueKey: 'id',
    label: 'Label',
  },
  template: {
    apiPath: 'dashboard_reports/templates',
    labelKey: 'name',
    valueKey: 'id',
    label: 'Template',
  },
  organization: {
    apiPath: 'dashboard_reports/organizations',
    labelKey: 'name',
    valueKey: 'id',
    label: 'Organization',
  },
  project: {
    apiPath: 'dashboard_reports/projects',
    labelKey: 'name',
    valueKey: 'id',
    label: 'Project',
  },
};

const PAGE_SIZE = 10;

function buildRequestUrl(
  queryOptions: AutomationDashboardAsyncQueryOptions,
  optionsPath: string,
  pageSize: number
): string {
  let url = metricsAPI`/${optionsPath}/?page_size=${pageSize}`;
  if (queryOptions.next) {
    url += `&page=${queryOptions.next}`;
  }
  if (queryOptions.search) {
    url += `&search=${encodeURIComponent(queryOptions.search)}`;
  }
  return url;
}

export function useAutomationDashboardToolbarFilters(
  props: AutomationDashboardToolbarFiltersProps
) {
  const { filterableFields } = props;
  const { t } = useTranslation();

  const queryResource = useCallback<
    (
      queryOptions: AutomationDashboardAsyncQueryOptions,
      key: string
    ) => Promise<PageAsyncSelectQueryResult<string>>
  >(async (queryOptions: AutomationDashboardAsyncQueryOptions, key: string) => {
    const field = FILTER_KEYS[key];
    const pageSize = queryOptions.pageSize ?? PAGE_SIZE;
    const labelKey = field.labelKey ?? 'name';
    const valueKey = field.valueKey ?? 'id';

    const itemsResponse = await requestGet<
      AwxItemsResponse<Record<string, string | number | undefined>>
    >(buildRequestUrl(queryOptions, field.apiPath, pageSize), queryOptions.signal);

    let next = '';
    let remaining = 0;
    // A page with a next page is full, so its length is the page size the API used: the API may
    // cap the requested page size (e.g. its max page size).
    const servedPageSize = itemsResponse.results.length;
    if (servedPageSize > 0 && itemsResponse.next) {
      const urlParams = new URLSearchParams(itemsResponse.next.split('?')[1]);
      const page = Object.fromEntries(urlParams.entries())?.page;
      if (page) {
        next = page;
        remaining = Math.max(0, itemsResponse.count - (Number.parseInt(page) - 1) * servedPageSize);
      }
    }

    return {
      remaining,
      next,
      options: itemsResponse.results.map((resource) => ({
        label: resource[labelKey]?.toString() ?? '',
        value: resource[valueKey]?.toString() ?? '',
      })),
    };
  }, []);

  const queryResourceLabel = useCallback((value: string, key: string) => {
    const field = FILTER_KEYS[key];
    return (
      <AsyncQueryLabel
        url={metricsAPI`/${field.apiPath}/`}
        id={value}
        field={field.labelKey ?? 'name'}
      />
    );
  }, []);

  return useMemo(() => {
    const seenKeys = new Set<string>();
    const toolbarFilters: AutomationDashboardAsyncFilter[] = [];

    filterableFields.forEach((filterKey) => {
      if (!filterKey || seenKeys.has(filterKey)) return;
      const field = FILTER_KEYS[filterKey];
      if (!field) return;
      seenKeys.add(filterKey);
      toolbarFilters.push({
        key: filterKey,
        label: t(field.label),
        type: ToolbarFilterType.AsyncMultiSelect,
        query: filterKey,
        placeholder: t('Select {{label}}', { label: t(field.label) }),
        queryErrorText: t('Failed to load options.'),
        queryLabel: (value: string) => queryResourceLabel(value, filterKey),
        queryOptions: (options) => queryResource(options, filterKey),
      });
    });

    return toolbarFilters;
  }, [filterableFields, t, queryResource, queryResourceLabel]);
}
