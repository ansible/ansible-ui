import { useCallback, useMemo } from 'react';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { useTranslation } from 'react-i18next';
import { Chip, ChipGroup } from '@patternfly/react-core';

export function useInventoriesGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (group: InventoryGroup) =>
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: { inventory_type: 'inventory', id: group.inventory, group_id: group.id },
      }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const relatedGroupColumn = useRelatedGroupsColumn();
  const tableColumns = useMemo<ITableColumn<InventoryGroup>[]>(
    () => [nameColumn, relatedGroupColumn, createdColumn, modifiedColumn],
    [nameColumn, relatedGroupColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}

function useRelatedGroupsColumn() {
  const { t } = useTranslation();

  const column: ITableColumn<InventoryGroup> = useMemo(
    () => ({
      header: t('Related Groups'),
      cell: (group) => {
        const groups: { results: Array<{ id: number; name: string }>; count: number } = group
          ?.summary_fields?.groups ?? {
          results: [],
          count: 0,
        };
        return (
          <ChipGroup aria-label={t`Related Groups`}>
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
