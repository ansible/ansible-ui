import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { useTranslation } from 'react-i18next';
import { Chip, ChipGroup } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';

export function useInventoriesGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams();
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
  const relatedGroupColumn = useRelatedGroupsColumn();

  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(() => {
    let columns: ITableColumn<InventoryGroup>[] = [];

    if (params.inventory_type === 'inventory') {
      columns = [nameColumn, relatedGroupColumn, createdColumn, modifiedColumn];
    }

    if (params.inventory_type === 'constructed_inventory') {
      columns = [nameColumn];
    }

    return columns;
  }, [nameColumn, relatedGroupColumn, createdColumn, modifiedColumn, params.inventory_type]);
  return tableColumns;
}

function useRelatedGroupsColumn() {
  const { t } = useTranslation();

  const column: ITableColumn<InventoryGroup> = useMemo(
    () => ({
      header: t('Related groups'),
      cell: (group) => {
        const groups: { results: Array<{ id: number; name: string }>; count: number } = group
          ?.summary_fields?.groups ?? {
          results: [],
          count: 0,
        };
        return (
          <ChipGroup aria-label={t`Related groups`}>
            {groups.results.map((group) => (
              <Chip key={group.name} isReadOnly>
                {group.name}
              </Chip>
            ))}
          </ChipGroup>
        );
      },
      sort: undefined,
      defaultSortDirection: 'desc',
    }),
    [t]
  );
  return column;
}
