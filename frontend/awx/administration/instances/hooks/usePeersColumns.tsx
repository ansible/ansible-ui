import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../common/columns';
import { Instance } from '../../../interfaces/Instance';

export function usePeersColumns(options?: { disableSort?: boolean }) {
  const { t } = useTranslation();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);

  const tableColumns = useMemo<ITableColumn<Instance>[]>(
    () => [
      {
        header: t('Host name'),
        cell: (peer) => <TextCell text={peer.hostname} />,
        sort: 'hostname',
        defaultSort: true,
      },
      {
        header: t('Node type'),
        cell: (peer) => peer.node_type,
      },
      createdColumn,
      modifiedColumn,
    ],

    [t, createdColumn, modifiedColumn]
  );

  return tableColumns;
}
