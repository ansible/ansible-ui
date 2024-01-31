import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  IToolbarFilter,
  TextCell,
  ToolbarFilterType,
} from '../../../../../framework';
import {
  useAsyncSingleSelectFilterBuilder,
  AsyncSelectFilterBuilderProps,
} from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { useHubView } from '../../../common/useHubView';
import { IRemotes } from './../../remotes/Remotes';
import { pulpAPI } from '../../../common/api/formatPath';

function useParameters(): AsyncSelectFilterBuilderProps<IRemotes> {
  const tableColumns = useRemoteColumns();
  const toolbarFilters = useRemoteFilters();
  const { t } = useTranslation();

  return {
    title: t`Select Remote`,
    tableColumns,
    toolbarFilters,
    useView: useHubView,
    viewParams: {
      url: pulpAPI`/remotes/ansible/collection/`,
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
      keyFn: (item) => item?.name,
    },
  };
}

export function useSelectRemoteSingle() {
  const params = useParameters();

  return useAsyncSingleSelectFilterBuilder<IRemotes>(params);
}

export function useRemoteColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<IRemotes>[]>(
    () => [
      {
        header: t('Name'),
        value: (remote) => remote.name,
        cell: (remote) => <TextCell text={remote.name} />,
      },
    ],
    [t]
  );
}

export function useRemoteFilters() {
  const { t } = useTranslation();

  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
