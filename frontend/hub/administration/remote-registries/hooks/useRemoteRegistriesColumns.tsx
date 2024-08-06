import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { HubRoute } from '../../../main/HubRoutes';
import { RemoteRegistry } from '../RemoteRegistry';

export function useRemoteRegistriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<RemoteRegistry>[]>(
    () => [
      {
        header: t('Name'),
        cell: (remoteRegistry) => (
          <TextCell
            text={remoteRegistry.name}
            to={getPageUrl(HubRoute.RemoteRegistryDetails, { params: { id: remoteRegistry.name } })}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Sync status'),
        cell: (remoteRegistry) => {
          if (Object.keys(remoteRegistry.last_sync_task).length > 0) {
            return <StatusCell status={remoteRegistry.last_sync_task.state} />;
          } else {
            return <TextCell text={t('Never synced')} />;
          }
        },
      },
      {
        header: t('Last sync'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.last_sync_task.finished_at,
        list: 'secondary',
      },
      {
        header: t('URL'),
        cell: (remoteRegistry) => <CopyCell text={remoteRegistry.url} />,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.updated_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
