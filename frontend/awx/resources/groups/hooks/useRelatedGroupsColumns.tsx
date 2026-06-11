import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useRelatedGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ inventory_type: string }>();
  const nameTo = useCallback(
    (group: InventoryGroup) =>
      getPageUrl(AwxRoute.InventoryGroupDetails, {
        params: { inventory_type: params.inventory_type, id: group.inventory, group_id: group.id },
      }),
    [getPageUrl, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
