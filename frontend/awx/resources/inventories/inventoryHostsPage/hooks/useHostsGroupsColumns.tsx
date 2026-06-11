import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useHostsGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  useGroupInventory?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; inventory_type: string }>();
  const nameTo = useCallback(
    (group: InventoryGroup) =>
      getPageUrl(AwxRoute.InventoryGroupDetails, {
        params: {
          id: options?.useGroupInventory === true ? group.summary_fields.inventory.id : params.id,
          group_id: group.id,
          inventory_type:
            options?.useGroupInventory === true
              ? kindToInventoryType(group.summary_fields.inventory.kind)
              : params.inventory_type,
        },
      }),
    [getPageUrl, options?.useGroupInventory, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    to: nameTo,
    ...options,
  });
  return useMemo<ITableColumn<InventoryGroup>[]>(() => [nameColumn], [nameColumn]);
}

function kindToInventoryType(kind: string) {
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

  return inventory_type;
}
