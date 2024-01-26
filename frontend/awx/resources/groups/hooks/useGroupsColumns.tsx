import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDescriptionColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';

export function useGroupsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (group: InventoryGroup) =>
      pageNavigate(AwxRoute.InventoryGroupDetails, { params: { id: group.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const createdColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
