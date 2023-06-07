import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../framework';
import { StatusCell } from '../../../common/StatusCell';
import { RemoteRegistry } from '../RemoteRegistry';

export function useRemoteRegistriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<RemoteRegistry>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (remoteRegistry) => remoteRegistry.name,
        card: 'name',
        list: 'name',
      },
      {
        header: t('Sync Status'),
        cell: (remoteRegistry) => <StatusCell status={remoteRegistry.last_sync_task.state} />,
      },
      {
        header: t('Last Sync'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.last_sync_task.finished_at,
        list: 'secondary',
      },
      {
        header: t('URL'),
        cell: (remoteRegistry) => <TextCell text={remoteRegistry.url} />,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last Updated'),
        type: 'datetime',
        value: (remoteRegistry) => remoteRegistry.updated_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}
