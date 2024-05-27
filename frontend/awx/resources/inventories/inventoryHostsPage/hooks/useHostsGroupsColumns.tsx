import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ITableColumn, usePageNavigate } from '../../../../../../framework';
import { useNameColumn } from '../../../../../common/columns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useHostsGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  useGroupInventory? : boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string; inventory_type: string }>();

  const nameClick = useCallback(
    (group: InventoryGroup) => {
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: {
          id: options?.useGroupInventory === true ? group.summary_fields.inventory.id : params.id,
          group_id: group.id,
          inventory_type : options?.useGroupInventory === true ? kindToInventoryType(group.summary_fields.inventory.kind) : params.inventory_type,
        },
      })},
    [pageNavigate, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });

  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(() => [nameColumn], [nameColumn]);

  return tableColumns;
}

function kindToInventoryType(kind : string)
{
  let inventory_type = '';

  if (kind === '') {
    inventory_type = 'inventory';
  }

  if (kind === 'smart') {
    inventory_type = 'smart_inventory';
  }

  if (kind === 'constructed') {
    inventory_type = 'constructed_inventory';
  }

  return inventory_type
}
