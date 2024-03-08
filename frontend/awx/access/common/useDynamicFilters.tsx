import { useCallback, useMemo } from 'react';
import { awxAPI } from '../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useOptions } from '../../../common/crud/useOptions';
import { IToolbarFilter, ToolbarFilterType } from '../../../../framework';
import { useTranslation } from 'react-i18next';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { QueryParams } from '../../common/useAwxView';
import { Organization } from '../../interfaces/Organization';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { UnifiedJobTemplate } from '../../interfaces/generated-from-swagger/api';
import { requestGet } from '../../../common/crud/Data';
import { DateRangeFilterPresets } from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarDateRangeFilter';
import { Project } from '../../interfaces/Project';

interface DynamicToolbarFiltersProps {
  /** API path of resource */
  optionsPath: string;
  /** Any additional query parameters needed to query resource values */
  params?: QueryParams;
  /** A list of keys to order the filters toolbar */
  preSortedKeys?: string[];
  /** A list of keys to pre-populate dropdown values */
  preFilledValueKeys?: string[];
  /** Any additional filters needed not provided by the API */
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

function craftRequestUrl(optionsPath: string, params: QueryParams | undefined, page: number) {
  let url = `api/v2/${optionsPath}/?page=${page}&page_size=100`;

  if (params) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    url += queryParams;
  }

  return url;
}

export function useDynamicToolbarFilters<
  T extends Organization | UnifiedJob | UnifiedJobTemplate | Project,
>(props: DynamicToolbarFiltersProps) {
  const { optionsPath, preFilledValueKeys, preSortedKeys, params, additionalFilters } = props;
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/${optionsPath}/`);
  const filterableFields = useFilters(data?.actions?.GET);
  const queryResource = useCallback(
    async (page: number, signal: AbortSignal, resourceKey: string) => {
      const resources = await requestGet<AwxItemsResponse<T>>(
        craftRequestUrl(optionsPath, params, page),
        signal
      );
      return {
        total: resources.count,
        options: resources.results
          .map((resource) => ({
            label: resource[resourceKey as keyof typeof resource]?.toString() || '',
            value: resource[resourceKey as keyof typeof resource]?.toString() || '',
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      };
    },
    [optionsPath, params]
  );

  const filters: IToolbarFilter[] = useMemo(() => {
    const getToolbars = (
      filterableFields: FilterableFields[],
      preFilledValueKeys?: string[],
      preSortedKeys?: string[],
      additionalFilters?: IToolbarFilter[]
    ): IToolbarFilter[] => {
      const toolbarFilters: IToolbarFilter[] = [];

      filterableFields.forEach((field) => {
        // Check if field.key is included in preFilledValueKeys
        const isPreFilled = preFilledValueKeys?.includes(field.key);

        // handle fields with options
        if (field.type === 'choice') {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.MultiSelect,
            placeholder: t(`Select ${field.key}`),
            query: field.query,
            options: field.options
              ? field.options.map((option) => ({ label: option.label, value: option.value }))
              : [],
          });
        } else if (field.type === 'boolean') {
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.SingleSelect,
            placeholder: t(`Filter by ${field.label}`),
            query: field.query,
            options: [
              { label: t('True'), value: 'true' },
              { label: t('False'), value: 'false' },
            ],
          });
        } else if (field.type === 'datetime') {
          // daterange calculations found in useAwxView.tsx
          toolbarFilters.push({
            key: field.key,
            label: t(field.label),
            type: ToolbarFilterType.DateRange,
            placeholder: t(`Filter by ${field.label}`),
            query: field.query,
            options: [
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
            queryOptions: (page: number, signal: AbortSignal) =>
              queryResource(page, signal, field.key),
            placeholder: `Select ${field.key}`,
            queryPlaceholder: `Loading ${field.key}...`,
            queryErrorText: `Failed to load ${field.key} options`,
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
    return getToolbars(filterableFields, preFilledValueKeys, preSortedKeys, additionalFilters);
  }, [filterableFields, additionalFilters, queryResource, preFilledValueKeys, preSortedKeys, t]);

  return filters;
}
