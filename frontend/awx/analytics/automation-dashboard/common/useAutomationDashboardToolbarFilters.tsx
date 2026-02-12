import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import {
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { AsyncQueryLabel } from '@ansible/common-ui/AsyncQueryLabel';
import { AsyncKeyOptions, AutomationDashboardToolbarFiltersProps } from '../interfaces';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseRequestUrl(
  queryOptions: PageAsyncSelectQueryOptions,
  optionsPath: string,
  labelKey: string,
  queryKey: string
) {
  /** TO Do: Replace baseUrl with dynamic value from config */
  const baseUrl = 'http://localhost:8000/api/v1';
  let url = `${baseUrl}/${optionsPath}/?page_size=20&order_by=${queryKey}`;
  if (queryOptions.next) {
    url += `&${queryKey}__gt=${queryOptions.next}`;
  }
  if (queryOptions.search) {
    url += `&${labelKey}__icontains=${queryOptions.search}`;
  }
  return decodeURIComponent(url);
}

export function useAutomationDashboardToolbarFilters(
  props: AutomationDashboardToolbarFiltersProps
) {
  const { filterableFields, additionalFilters } = useRef(props).current;
  const { t } = useTranslation();

  const queryResource = useCallback<
    (
      queryOptions: PageAsyncSelectQueryOptions,
      key: string
    ) => Promise<PageAsyncSelectQueryResult<string>>
  >(async (queryOptions: PageAsyncSelectQueryOptions, key: string) => {
    const field = automationDashboardFiltersKeys[key];
    const labelKey = field.labelKey || 'name';
    const valueKey = field.valueKey || 'id';

    /**
     * Fetch options from the API endpoint
     * Temporary comment until backend is ready
    const url = parseRequestUrl(queryOptions, field.apiPath, labelKey, valueKey);
    const itemsResponse = await requestGet<
      AwxItemsResponse<Record<string, string | number | undefined>>
    >(url, queryOptions.signal);
    */
    let next: string = '';
    const itemsResponse = await fetchAutomationDashboardFilterOptions(key);
    const resultsLength = itemsResponse.results.length;
    if (resultsLength > 0) {
      const value = itemsResponse.results[resultsLength - 1][valueKey];
      next = value?.toString() ?? '';
    }
    return {
      remaining: itemsResponse.count - itemsResponse.results.length,
      options: itemsResponse.results.map((resource) => {
        const label = resource[labelKey]?.toString() || '';
        return { label, value: resource[valueKey]?.toString() || '' };
      }),
      next,
    };
  }, []);

  const queryResourceLabel = useCallback((value: string, key: string) => {
    const field = automationDashboardFiltersKeys[key];
    return (
      <AsyncQueryLabel
        url={`http://localhost:8000/api/v1/${field.apiPath}/`}
        id={value}
        field={field.labelKey}
      />
    );
  }, []);

  return useMemo(() => {
    const getToolbarFilterByKey = (
      filterableFields: string[],
      additionalFilters?: IToolbarFilter[]
    ): IToolbarFilter[] => {
      const toolbarFilters: IToolbarFilter[] = [];
      const seenKeys = new Set<string>();
      filterableFields.forEach((filterableField) => {
        if (!filterableField) return; // skip empty string
        if (seenKeys.has(filterableField)) return; // skip duplicates
        const field = automationDashboardFiltersKeys[filterableField];
        if (!field) return; // skip unknown keys
        seenKeys.add(filterableField);
        toolbarFilters.push({
          key: filterableField,
          label: field.label ?? filterableField,
          type: ToolbarFilterType.AsyncMultiSelect,
          query: `${field.labelKey ?? 'name'}__icontains`,
          queryPlaceholder: t('Loading...'),
          placeholder: t(`Select ${field.label}`),
          queryErrorText: t('Failed to load options.'),
          queryLabel: (value: string) => queryResourceLabel(value, filterableField),
          queryOptions: (options) => queryResource(options, filterableField),
        });
      });
      if (additionalFilters && toolbarFilters.length > 0) {
        if (Array.isArray(additionalFilters)) {
          toolbarFilters.push(...additionalFilters);
        } else {
          toolbarFilters.push(additionalFilters);
        }
      }
      return toolbarFilters;
    };
    return getToolbarFilterByKey(filterableFields, additionalFilters);
  }, [filterableFields, additionalFilters, t, queryResource, queryResourceLabel]);
}

const automationDashboardFiltersKeys: Record<string, AsyncKeyOptions> = {
  label: { apiPath: 'labels', labelKey: 'name', valueKey: 'id', label: 'Label' },
  template: { apiPath: 'templates', labelKey: 'name', valueKey: 'id', label: 'Template' },
  organization: {
    apiPath: 'organizations',
    labelKey: 'name',
    valueKey: 'id',
    label: 'Organization',
  },
  project: { apiPath: 'projects', labelKey: 'name', valueKey: 'id', label: 'Project' },
};

/**
This is temporary code to be used until the Automation Dashboard backend is ready.
In the future, this function will be replaced with actual API calls to fetch filter options.
*/

function fetchAutomationDashboardFilterOptions(
  key: string
): Promise<AwxItemsResponse<Record<string, string | number | undefined>>> {
  const data: Record<string, string | number | undefined>[] = mockedData[key];
  const mockData = {
    count: data.length,
    next: null,
    previous: null,
    results: data,
  };
  return Promise.resolve(mockData);
}

const mockedData: Record<string, Record<string, string | number | undefined>[]> = {
  template: [
    { id: 1, name: 'Template 1' },
    { id: 2, name: 'Template 2' },
    { id: 3, name: 'Template 3' },
    { id: 4, name: 'Template 4' },
    { id: 5, name: 'Template 5' },
    { id: 6, name: 'Template 6' },
    { id: 7, name: 'Template 7' },
  ],
  label: [
    { id: 1, name: 'Label 1' },
    { id: 2, name: 'Label 2' },
    { id: 3, name: 'Label 3' },
    { id: 4, name: 'Label 4' },
  ],
  organization: [
    { id: 1, name: 'Organization 1' },
    { id: 2, name: 'Organization 2' },
    { id: 3, name: 'Organization 3' },
  ],
  project: [
    { id: 1, name: 'Project 1' },
    { id: 2, name: 'Project 2' },
    { id: 3, name: 'Project 3' },
    { id: 4, name: 'Project 4' },
  ],
};
