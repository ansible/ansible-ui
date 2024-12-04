import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '@ansible/common-ui/columns';
import { Chip, ChipGroup } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInventoriesGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const params = useParams();
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
