import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import {
  useNameColumn,
  useDescriptionColumn,
  useCreatedColumn,
  useModifiedColumn,
} from '../../../../common/columns';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';

export function useHostsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (host: AwxHost) => pageNavigate(AwxRoute.HostDetails, { params: { id: host.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
