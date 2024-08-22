import { Chip, ChipGroup } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import { useNameColumn, useCreatedColumn, useModifiedColumn } from '../../../../common/columns';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';
import { useParams } from 'react-router-dom';
import { Sparkline } from '../../templates/components/Sparkline';
import { useInventoryNameColumn } from '../../../../common/columns';

function useActivityColumn(name: 'Activity' | 'Recent jobs') {
  const { t } = useTranslation();
  const column: ITableColumn<AwxHost> = useMemo(
    () => ({
      header: name === 'Activity' ? t('Activity') : name === 'Recent jobs' ? t('Recent jobs') : '',
      cell: (item) => <Sparkline jobs={item.summary_fields?.recent_jobs} />,
      value: (item) =>
        item.summary_fields?.recent_jobs && item.summary_fields?.recent_jobs?.length > 0,
      card: 'hidden',
      list: 'hidden',
    }),
    [t, name]
  );
  return column;
}

function useDescriptionColumn() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<AwxHost>>(
    () => ({
      header: t('Description'),
      type: 'description',
      value: (host: AwxHost) => host.description,
      list: 'description',
      card: 'description',
    }),
    [t]
  );
  return column;
}

export function useInventoriesHostsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ inventory_type: string; id: string }>();
  const nameClick = useCallback(
    (host: AwxHost) =>
      pageNavigate(AwxRoute.InventoryHostDetails, {
        params: {
          inventory_type: params.inventory_type,
          id: params.id,
          host_id: host.id,
        },
      }),
    [pageNavigate, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const relatedGroupColumn = useRelatedGroupsColumn();
  const recentJobs = useActivityColumn('Recent jobs');
  const inventoryColumn = useInventoryNameColumn(AwxRoute.InventoryDetails, {
    tableViewOption: undefined,
  });

  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(() => {
    let columns: ITableColumn<AwxHost>[] = [];

    if (params.inventory_type === 'inventory') {
      columns = [nameColumn, descriptionColumn, relatedGroupColumn, createdColumn, modifiedColumn];
    }

    if (
      params.inventory_type === 'smart_inventory' ||
      params.inventory_type === 'constructed_inventory'
    ) {
      recentJobs.sort = '';
      inventoryColumn.sort = '';
      columns = [nameColumn, recentJobs, inventoryColumn];
    }
    return columns;
  }, [
    nameColumn,
    descriptionColumn,
    relatedGroupColumn,
    createdColumn,
    modifiedColumn,
    recentJobs,
    inventoryColumn,
    params.inventory_type,
  ]);
  return tableColumns;
}

export function useInventoriesGroupHostsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ inventory_type: string; id: string }>();
  const nameClick = useCallback(
    (host: AwxHost) =>
      pageNavigate(AwxRoute.InventoryHostDetails, {
        params: {
          inventory_type: params.inventory_type,
          id: params.id,
          host_id: host.id,
        },
      }),
    [pageNavigate, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const activityColumn = useActivityColumn('Activity');
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, activityColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, activityColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}

function useRelatedGroupsColumn() {
  const { t } = useTranslation();

  const column: ITableColumn<AwxHost> = useMemo(
    () => ({
      header: t('Related groups'),
      cell: (host) => {
        const groups: { results: Array<{ id: number; name: string }>; count: number } = host
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
