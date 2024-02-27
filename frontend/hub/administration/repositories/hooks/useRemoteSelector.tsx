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
  useAsyncSingleSelectFilterBuilder,
} from '../../../../../framework/PageToolbar/PageToolbarFilters/ToolbarAsyncSelectFilterBuilder';
import { pulpAPI } from '../../../common/api/formatPath';
import { useHubView } from '../../../common/useHubView';
import { HubRemote } from './../../remotes/Remotes';

function useParameters(): AsyncSelectFilterBuilderProps<HubRemote> {
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

  return useAsyncSingleSelectFilterBuilder<HubRemote>(params);
}

export function useRemoteColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  return useMemo<ITableColumn<HubRemote>[]>(
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
        type: ToolbarFilterType.SingleText,
        query: 'name__icontains',
        comparison: 'contains',
      },
    ],
    [t]
  );
}
