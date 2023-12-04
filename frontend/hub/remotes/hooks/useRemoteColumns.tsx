import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { IRemotes } from '../Remotes';

export function useRemoteColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<IRemotes>[]>(
    () => [
      {
        header: t('Remote name'),
        cell: (remote) => (
          <TextCell
            text={remote.name}
            to={getPageUrl(HubRoute.RemotePage, { params: { id: remote.name } })}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('URL'),
        cell: (remote) => <CopyCell text={remote.url} />,
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
    [getPageUrl, t]
  );
  return tableColumns;
}
