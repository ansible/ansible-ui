import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ITableColumn, usePageNavigate } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useHostsGroupsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();
  const nameClick = useCallback(
    (group: InventoryGroup) =>
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: {
          id: params.id,
          group_id: group.id,
          inventory_type: params.inventory_type,
        },
      }),
    [pageNavigate, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });

  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(() => [nameColumn], [nameColumn]);

  return tableColumns;
}
