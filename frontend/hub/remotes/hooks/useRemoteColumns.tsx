import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../framework';
import { IRemotes } from '../Remotes';

export function useRemoteColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<IRemotes>[]>(
    () => [
      {
        header: t('Remote name'),
        cell: (remote) => <TextCell text={remote.name} />,
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
    ],
    [t]
  );
  return tableColumns;
}
