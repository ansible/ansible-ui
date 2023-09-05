import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../framework';
import { IRemotes } from '../Remotes';
import { RouteObj } from '../../../common/Routes';

export function useRemoteColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<IRemotes>[]>(
    () => [
      {
        header: t('Remote name'),
        cell: (remote) => (
          <TextCell text={remote.name} to={RouteObj.RemoteDetails.replace(':id', remote.name)} />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('URL'),
        cell: (remote) => <TextCell text={remote.url} />,
        sort: 'url',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Created'),
        cell: (remote) => <TextCell text={remote.pulp_created} />,
        sort: 'pulp_created',
        defaultSort: true,
        defaultSortDirection: 'desc',
        table: ColumnTableOption.Hidden,
      },
    ],
    [t]
  );
  return tableColumns;
}
