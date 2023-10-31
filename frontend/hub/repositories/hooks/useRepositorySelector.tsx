import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, TextCell, ToolbarFilterType } from '../../../../framework';
import { AnsibleAnsibleRepositoryResponse as Repository } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import {
  useAsyncSingleSelectFilterBuilder,
  useAsyncMultiSelectFilterBuilder,
  AsyncSelectFilterBuilderProps,
} from '../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { usePulpView } from '../../usePulpView';
import { pulpAPI } from '../../api/utils';

function useParameters(): AsyncSelectFilterBuilderProps<Repository> {
  const tableColumns = useRepositoryColumns();
  const toolbarFilters = useRepositoryFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Repository`,
    tableColumns,
    toolbarFilters,
    useView: usePulpView,
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
        type: ToolbarFilterType.Text,
        query: 'name',
        comparison: 'equals',
      },
    ],
    [t]
  );
}
