import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../framework';
import {
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '../../../framework/PageInputs/PageAsyncSelectOptions';
import { DateRangeFilterPresets } from '../../../framework/PageToolbar/PageToolbarFilters/ToolbarDateRangeFilter';
import { AsyncQueryLabel } from '../../../framework/components/AsyncQueryLabel';
import { requestGet } from '../../common/crud/Data';
import { useOptions } from '../../common/crud/useOptions';
import { AwxItemsResponse } from '../common/AwxItemsResponse';
import { awxAPI } from '../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

interface DynamicToolbarFiltersProps {
  /** API endpoint for the options that generated the filters */
  optionsPath: string;

  /** A list of keys to order the filters toolbar */
  preSortedKeys?: string[];

  /** A list of keys to pre-populate dropdown values. Note: knownAwxFilterKeys adds some keys that require quering specific endpoints */
  preFilledValueKeys?: string[];

  /** Additional filters in addition to the dynamic filters */
  additionalFilters?: IToolbarFilter[];
}

interface FilterableFields {
  key: string;
  type: string;
  label: string;
  query: string;
  options?: { value: string; label: string }[];
}

export function useFilters(actions?: { [key: string]: ActionsResponse }) {
  return useMemo(() => {
    if (!actions) {
      return [];
    }
    const filterableFields = Object.entries(actions).reduce<
      {
        key: string;
        type: string;
        label: string;
        query: string;
        options?: { value: string; label: string }[];
      }[]
    >((acc, [key, value]) => {
      if (value.filterable) {
        acc.push({
          key,
          type: value.type,
          label: value.label,
          query: key,
          options: value.choices ? value.choices.map(([value, label]) => ({ value, label })) : [],
        });
      }
      return acc;
    }, []);
    return filterableFields;
  }, [actions]);
}

function craftRequestUrl(
  queryOptions: PageAsyncSelectQueryOptions,
  optionsPath: string,
  labelKey: string,
  queryKey: string,
  queryParams?: Record<string, string>
) {
  let url = awxAPI`/${optionsPath}/?page_size=10&order_by=${queryKey}`;
  if (queryOptions.next) {
    url += `&${queryKey}__gt=${queryOptions.next}`;
  }
  if (queryOptions.search) {
    url += `&${labelKey}__icontains=${queryOptions.search}`;
  }
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url += `&${key}=${value}`;
    });
  }
  return url;
}

export function useDynamicToolbarFilters(props: DynamicToolbarFiltersProps) {
  const { optionsPath, preSortedKeys, preFilledValueKeys, additionalFilters } = props;
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/${optionsPath}/`);
  const filterableFields = useFilters(data?.actions?.GET);
  const queryResource = useCallback<
    (
      queryOptions: PageAsyncSelectQueryOptions,
      key: string
    ) => Promise<PageAsyncSelectQueryResult<string>>
  >(
    async (queryOptions: PageAsyncSelectQueryOptions, key: string) => {
      const knownAwxFilterKey = knownAwxFilterKeys[key];
      if (knownAwxFilterKey) {
        const labelKey = knownAwxFilterKey.labelKey || 'name';
        const valueKey = knownAwxFilterKey.valueKey || 'id';
        const itemsResponse = await requestGet<
          AwxItemsResponse<Record<string, string | number | undefined>>
        >(
          craftRequestUrl(
            queryOptions,
            knownAwxFilterKey.apiPath,
            labelKey,
            valueKey,
            knownAwxFilterKey.queryParams
          ),
          queryOptions.signal
        );
        let next: string = '';
        if (itemsResponse.results.length > 0) {
          const value = itemsResponse.results[itemsResponse.results.length - 1][valueKey];
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
      } else {
        const itemsResponse = await requestGet<
          AwxItemsResponse<Record<string, string | number | undefined>>
        >(craftRequestUrl(queryOptions, optionsPath, key, key), queryOptions.signal);
        let next: string = '';
        if (itemsResponse.results.length > 0) {
          const value = itemsResponse.results[itemsResponse.results.length - 1][key];
          next = value?.toString() ?? '';
        }
        return {
          remaining: itemsResponse.count - itemsResponse.results.length,
          options: itemsResponse.results.map((resource) => ({
            label: resource[key]?.toString() || '',
            value: resource[key]?.toString() || '',
          })),
          next,
        };
      }
    },
    [optionsPath]
  );
  const queryResourceLabel = useCallback((value: string, key: string) => {
    const knownAwxFilterKey = knownAwxFilterKeys[key];
    if (knownAwxFilterKey) {
      return (
        <AsyncQueryLabel
          url={awxAPI`/${knownAwxFilterKey.apiPath}/`}
          id={value}
          field={knownAwxFilterKey.labelKey}
        />
      );
    }
    return value;
  }, []);

  const filters: IToolbarFilter[] = useMemo(() => {
    const getToolbars = (
      filterableFields: FilterableFields[],
      preSortedKeys?: string[],
      preFilledValueKeys?: string[],
      additionalFilters?: IToolbarFilter[]
    ): IToolbarFilter[] => {
      const toolbarFilters: IToolbarFilter[] = [];

      filterableFields.forEach((field) => {
        // Check if field.key is included in preFilledValueKeys
        let isPreFilled = preFilledValueKeys?.includes(field.key) || false;
        if (knownAwxFilterKeys[field.key]) {
          isPreFilled = true;
        }

        // handle fields with options
        if (field.type === 'choice') {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.MultiSelect,
            placeholder: t(`Select {{field}}`, { field: field.label.toLowerCase() }),
            query: field.query,
            options: field.options ? field.options : [],
            disableSortOptions: true,
          });
        } else if (field.type === 'boolean') {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.SingleSelect,
            placeholder: t(`Filter by {{field}}`, { field: field.label.toLowerCase() }),
            query: field.query,
            options: [
              { label: t('True'), value: 'true' },
              { label: t('False'), value: 'false' },
            ],
            disableSortOptions: true,
          });
        } else if (field.type === 'datetime') {
          // daterange calculations found in useAwxView.tsx
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.DateRange,
            placeholder: t(`Filter by {{field}}`, { field: field.label.toLowerCase() }),
            query: field.query,
            options: [
              { label: t('Last hour'), value: DateRangeFilterPresets.LastHour },
              { label: t('Last 24 hours'), value: DateRangeFilterPresets.Last24Hours },
              { label: t('Last 7 days'), value: DateRangeFilterPresets.LastWeek },
              { label: t('Last 30 days'), value: DateRangeFilterPresets.LastMonth },
            ],
          });
        } else if (isPreFilled) {
          // Check if field.key is included in preFilledValueKeys
          toolbarFilters.push({
            key: field.key,
            query: field.query,
            label: t(field.label),
            type: ToolbarFilterType.AsyncMultiSelect,
            queryOptions: (options) => queryResource(options, field.key),
            placeholder: t(`Select {{field}}`, { field: field.label.toLowerCase() }),
            queryPlaceholder: t('Loading...'),
            queryErrorText: t('Failed to load options.'),
            queryLabel: (value: string) => queryResourceLabel(value, field.key),
          });
        } else {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.MultiText,
            query: `${field.key}__icontains`,
            comparison: 'contains',
          });
        }
      });
      // add additional filters if provided
      if (additionalFilters && toolbarFilters.length > 0) {
        if (Array.isArray(additionalFilters)) {
          toolbarFilters.push(...additionalFilters);
        } else {
          toolbarFilters.push(additionalFilters);
        }
      }
      // Sort toolbarFilters based on preSortedKeys
      if (preSortedKeys && preSortedKeys.length > 0) {
        toolbarFilters.sort((a, b) => {
          const indexA = preSortedKeys.indexOf(a.key);
          const indexB = preSortedKeys.indexOf(b.key);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      return toolbarFilters;
    };
    return getToolbars(filterableFields, preSortedKeys, preFilledValueKeys, additionalFilters);
  }, [
    filterableFields,
    preSortedKeys,
    preFilledValueKeys,
    additionalFilters,
    t,
    queryResource,
    queryResourceLabel,
  ]);

  return filters;
}

interface AsyncKeyOptions {
  /** The API endpoint for the options that will be loaded asynchronously
   * @example 'execution_environments'
   */
  apiPath: string;

  /**
   * The key to be used as the label for the resource.
   * @default 'name'
   */
  labelKey?: string;

  /**
   * The key to be used as the value for the resource.
   * @default 'id'
   */
  valueKey?: string;

  /**
   * Additional query parameters to be used when fetching the options
   */
  queryParams?: Record<string, string>;
}

/** A list of known keys that require querying specific endpoints. We pre-fetch these values if available */
export const knownAwxFilterKeys: Record<string, AsyncKeyOptions> = {
  organization: { apiPath: 'organizations' },
  project: { apiPath: 'projects' },
  execution_environment: { apiPath: 'execution_environments' },
  unified_job_template: { apiPath: 'unified_job_templates' },
  execution_node: {
    labelKey: 'hostname',
    apiPath: 'instances',
    queryParams: { node_type: 'execution' },
  },
  controller_node: {
    labelKey: 'hostname',
    apiPath: 'instances',
    queryParams: { node_type: 'control' },
  },
};
