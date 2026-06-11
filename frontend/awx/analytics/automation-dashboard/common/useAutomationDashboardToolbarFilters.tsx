import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import {
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { AsyncKeyOptions, AutomationDashboardToolbarFiltersProps } from '../types';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { metricsAPI } from '../../../common/api/metrics-utils';

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

function buildRequestUrl(queryOptions: PageAsyncSelectQueryOptions, optionsPath: string): string {
  let url = metricsAPI`/${optionsPath}/?page_size=${PAGE_SIZE}`;
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
  const { filterableFields, additionalFilters } = props;
  const { t } = useTranslation();

  const queryResource = useCallback<
    (
      queryOptions: PageAsyncSelectQueryOptions,
      key: string
    ) => Promise<PageAsyncSelectQueryResult<string>>
  >(async (queryOptions: PageAsyncSelectQueryOptions, key: string) => {
    const field = FILTER_KEYS[key];
    const labelKey = field.labelKey ?? 'name';
    const valueKey = field.valueKey ?? 'id';

    const itemsResponse = await requestGet<
      AwxItemsResponse<Record<string, string | number | undefined>>
    >(buildRequestUrl(queryOptions, field.apiPath), queryOptions.signal);

    let next = '';
    let remaining = 0;
    if (itemsResponse.results.length > 0 && itemsResponse.next) {
      const urlParams = new URLSearchParams(itemsResponse.next.split('?')[1]);
      const page = Object.fromEntries(urlParams.entries())?.page;
      if (page) {
        next = page;
        remaining = itemsResponse.count - (Number.parseInt(page) - 1) * PAGE_SIZE;
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
    const toolbarFilters: IToolbarFilter[] = [];

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
        queryPlaceholder: t('Loading...'),
        queryErrorText: t('Failed to load options.'),
        queryLabel: (value: string) => queryResourceLabel(value, filterKey),
        queryOptions: (options) => queryResource(options, filterKey),
      });
    });

    if (additionalFilters) {
      toolbarFilters.push(...additionalFilters);
    }

    return toolbarFilters;
  }, [filterableFields, additionalFilters, t, queryResource, queryResourceLabel]);
}
