import {
  ITableColumn,
  IToolbarFilter,
  TextCell,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from '../../../common/ToolbarAsyncSelectFilterBuilder';
import { pulpAPI } from '../../../common/api/formatPath';
import { isInsightsMode } from '../../../common/isInsights';
import { useHubView } from '../../../common/useHubView';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { MultiDialogs } from './useAddCollections';

function useParameters(multiDialogs?: MultiDialogs): AsyncSelectFilterBuilderProps<Repository> {
  const tableColumns = useRepositoryColumns();
  const toolbarFilters = useRepositoryFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Repository`,
    tableColumns,
    toolbarFilters,
    useView: useHubView,
    viewParams: {
      url: pulpAPI`/repositories/ansible/ansible/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn: (item) => item?.name,
    },
    multiDialogs,
  };
}

export function useSelectRepositoryMulti(multiDialogs?: MultiDialogs) {
  const params = useParameters(multiDialogs);

  return useAsyncMultiSelectFilterBuilder<Repository>(params);
}

export function useSelectRepositorySingle(multiDialogs?: MultiDialogs) {
  const params = useParameters(multiDialogs);

  return useAsyncSingleSelectFilterBuilder<Repository>(params);
}

export function useRepositoryColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        value: (repo) => repo.name,
        cell: (repo) => <TextCell text={repo.name} />,
      },

      {
        header: t('Description'),
        type: 'description',
        value: (repo) => repo.description,
      },
    ],
    [t]
  );
}

export function useRepositoryFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        // Insights mode requires name__icontains for case-insensitive partial matching
        // Platform mode uses name for exact matching
        query: isInsightsMode() ? 'name__icontains' : 'name',
        comparison: isInsightsMode() ? 'contains' : 'equals',
      },
      {
        key: 'pipeline',
        label: t('Pipeline'),
        type: ToolbarFilterType.SingleSelect,
        query: 'pulp_label_select',
        placeholder: t('Pipeline'),
        options: [
          { label: t('Needs review'), value: `pipeline=staging` },
          { label: t('Approved'), value: `pipeline=approved` },
          { label: t('Rejected'), value: `pipeline=rejected` },
        ],
      },
    ],
    [t]
  );
}

export function useRepositoryCollectionVersionFiltersRemove() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Keywords'),
        type: ToolbarFilterType.SingleText,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.SingleText,
        query: 'namespace',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
