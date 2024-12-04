import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useDescriptionColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useGroupsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (group: InventoryGroup) =>
      getPageUrl(AwxRoute.InventoryGroupDetails, {
        params: { id: group.id },
      }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
  const createdColumn = useDescriptionColumn();
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, createdColumn, modifiedColumn],
    [nameColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
