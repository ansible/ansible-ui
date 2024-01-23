import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useInventoriesGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (group: InventoryGroup) =>
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: {
          id: group.id,
        },
      }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });

  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(() => [nameColumn], [nameColumn]);

  return tableColumns;
}
