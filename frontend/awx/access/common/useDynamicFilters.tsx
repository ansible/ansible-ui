import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { DateRangeFilterPresets } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarDateRangeFilter';
import { requestGet } from '../../../common/crud/Data';
import { useOptions } from '../../../common/crud/useOptions';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { QueryParams } from '../../common/useAwxView';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';

interface DynamicToolbarFiltersProps {
  /** API endpoint for the options that generated the filters */
  optionsPath: string;

  /** These keys will be sorted first before the rest of the keys */
  preSortedKeys?: string[];

  /** Keys and options for filters that will be loaded asynchronously */
  asyncKeys?: { [key: string]: AsyncKeyOptions | undefined };

  /** Additional filters in addition to the dynamic filters */
  additionalFilters?: IToolbarFilter[];
}

interface AsyncKeyOptions {
  /** The API endpoint for the options that will be loaded asynchronously
   * @example 'execution_environments'
   */
  resourcePath: string;
  /**
   * The query parameters for the options that will be loaded asynchronously
   * @example { order_by: '-created' }
   */
  params: QueryParams;
  /**
   * The key to be used as the label for the resource
   * @example 'name'
   */
  resourceLabelKey?: string;
  /**
   * The key to be used as the value for the resource
   * @example 'id'
   */
  resourceKey?: string;
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

function craftRequestUrl(optionsPath: string, params: QueryParams | undefined, page: number) {
  let url = `api/v2/${optionsPath}/?page=${page}&page_size=100`;

  if (params) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += '&' + queryParams;
  }

  return url;
}

export function useDynamicToolbarFilters<T>(props: DynamicToolbarFiltersProps) {
  const { optionsPath, preSortedKeys, asyncKeys, additionalFilters } = props;
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/${optionsPath}/`);
  const filterableFields = useFilters(data?.actions?.GET);
  const queryResource = useCallback(
    async (page: number, signal: AbortSignal, key: string) => {
      const asyncKey = asyncKeys?.[key];
      const resourceKey = asyncKey?.resourceKey || key;
      const resourceLabelKey = asyncKey?.resourceLabelKey || resourceKey;
      const resources = await requestGet<AwxItemsResponse<T>>(
        craftRequestUrl(asyncKey ? asyncKey.resourcePath : optionsPath, asyncKey?.params, page),
        signal
      );
      return {
        total: resources.count,
        options: resources.results.map((resource) => ({
          label: resource[resourceLabelKey as keyof typeof resource]?.toString() || '',
          desciption: resource['description' as keyof typeof resource],
          value: resource[resourceKey as keyof typeof resource]?.toString() || '',
        })),
      };
    },
    [asyncKeys, optionsPath]
  );
  const queryResourceLabel = useCallback(
    async (value: string, key: string) => {
      const asyncKey = asyncKeys?.[key];
      const resourceKey = asyncKey?.resourceKey;
      if (!resourceKey) return value;
      const resourceLabelKey = asyncKey?.resourceLabelKey || resourceKey;
      try {
        const resource = await requestGet<T>(`api/v2/${asyncKey?.resourcePath}/${value}/`);
        return resource[resourceLabelKey as keyof typeof resource]?.toString() || '';
      } catch {
        return value;
      }
    },
    [asyncKeys]
  );

  const filters: IToolbarFilter[] = useMemo(() => {
    const getToolbars = (
      filterableFields: FilterableFields[],
      preSortedKeys?: string[],
      asyncKeys?: { [key: string]: AsyncKeyOptions | undefined },
      additionalFilters?: IToolbarFilter[]
    ): IToolbarFilter[] => {
      const toolbarFilters: IToolbarFilter[] = [];

      filterableFields.forEach((field) => {
        // Check if field.key is included in asyncKeys
        const isPreFilled = !!asyncKeys?.[field.key];

        // handle fields with options
        if (field.type === 'choice') {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.MultiSelect,
            placeholder: t(`Select {{field}}`, { field: field.label.toLowerCase() }),
            query: field.query,
            options: field.options
              ? field.options.map((option) => ({ label: option.label, value: option.value }))
              : [],
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
          // Check if field.key is included in asyncKeys
          toolbarFilters.push({
            key: field.key,
            query: field.query,
            label: t(field.label),
            type: ToolbarFilterType.AsyncMultiSelect,
            queryOptions: (page: number, signal: AbortSignal) =>
              queryResource(page, signal, field.key),
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
    return getToolbars(filterableFields, preSortedKeys, asyncKeys, additionalFilters);
  }, [
    filterableFields,
    preSortedKeys,
    asyncKeys,
    additionalFilters,
    t,
    queryResource,
    queryResourceLabel,
  ]);

  return filters;
}
