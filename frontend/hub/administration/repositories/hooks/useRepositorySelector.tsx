import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  IToolbarFilter,
  TextCell,
  ToolbarFilterType,
} from '../../../../../framework';
import {
  AsyncSelectFilterBuilderProps,
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../../../interfaces/generated/AnsibleAnsibleRepositoryResponse';

function useParameters(): AsyncSelectFilterBuilderProps<Repository> {
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
  };
}

export function useSelectRepositoryMulti() {
  const params = useParameters();

  return useAsyncMultiSelectFilterBuilder<Repository>(params);
}

export function useSelectRepositorySingle() {
  const params = useParameters();

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
        type: ToolbarFilterType.MultiText,
        query: 'name',
        comparison: 'equals',
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
      {
        key: 'remote',
        label: t('Remote'),
        type: ToolbarFilterType.SingleSelect,
        placeholder: t('Remote'),
        query: 'remote',
        options: [
          { label: t('None'), value: 'null' },
          // TODO get all remotes
        ],
      },
    ],
    [t]
  );
}

export function useRepositoryCollectionVersionFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Keywords'),
        type: ToolbarFilterType.MultiText,
        query: 'keywords',
        comparison: 'equals',
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: ToolbarFilterType.MultiText,
        query: 'namespace',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
