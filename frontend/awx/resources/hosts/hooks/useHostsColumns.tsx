import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import {
  useNameColumn,
  useDescriptionColumn,
  useInventoryNameColumn,
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
  const descriptionColumn = useDescriptionColumn({
    tableViewOption: undefined,
    disableSort: false,
  });
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, {
    tableViewOption: undefined,
  });
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, inventoryColumn],
    [nameColumn, descriptionColumn, inventoryColumn]
  );
  return tableColumns;
}
