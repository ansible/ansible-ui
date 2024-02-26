import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ITableColumn, usePageNavigate } from '../../../../../../framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../../common/columns';
import { InventoryGroup } from '../../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useRelatedGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ inventory_type: string }>();
  const nameClick = useCallback(
    (group: InventoryGroup) =>
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: { inventory_type: params.inventory_type, id: group.inventory, group_id: group.id },
      }),
    [pageNavigate, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
