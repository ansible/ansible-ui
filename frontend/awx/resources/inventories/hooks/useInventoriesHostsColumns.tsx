import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useInventoryNameColumn,
  useModifiedColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { Label, LabelGroup } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { Sparkline } from '../../templates/components/Sparkline';

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
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ inventory_type: string; id: string }>();
  const nameTo = useCallback(
    (host: AwxHost) =>
      getPageUrl(AwxRoute.InventoryHostDetails, {
        params: {
          inventory_type: params.inventory_type,
          id: params.id,
          host_id: host.id,
        },
      }),
    [getPageUrl, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
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
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ inventory_type: string; id: string }>();
  const nameTo = useCallback(
    (host: AwxHost) =>
      getPageUrl(AwxRoute.InventoryHostDetails, {
        params: {
          inventory_type: params.inventory_type,
          id: params.id,
          host_id: host.id,
        },
      }),
    [getPageUrl, params.id, params.inventory_type]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
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
          <LabelGroup aria-label={t`Related groups`}>
            {groups.results.map((group) => (
              <Label variant="outline" key={group.name}>
                {group.name}
              </Label>
            ))}
          </LabelGroup>
        );
      },
      sort: undefined,
      defaultSortDirection: 'desc',
    }),
    [t]
  );
  return column;
}
