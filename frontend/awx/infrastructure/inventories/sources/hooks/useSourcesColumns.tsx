import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../../common/columns';
import { InventorySource } from '../../../../interfaces/InventorySource';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useSourcesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (source: InventorySource) =>
      pageNavigate(AwxRoute.InventorySourceDetail, { params: { id: source.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
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
