import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useSourcesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (item: InventorySource) =>
      getPageUrl(AwxRoute.InventorySourceDetail, { params: { id: item.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    to: nameTo,
    ...options,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<InventorySource>[]>(
    () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
