import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';

export function useRemoteColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<HubRemote>[]>(
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
      },
      {
        header: t('URL'),
        cell: (remote) => <CopyCell text={remote.url} />,
        sort: 'url',
      },
      {
        header: t('Created'),
        cell: (remote) => <TextCell text={remote.pulp_created} />,
        sort: 'pulp_created',
        defaultSort: true,
        defaultSortDirection: 'desc',
        table: ColumnTableOption.hidden,
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
