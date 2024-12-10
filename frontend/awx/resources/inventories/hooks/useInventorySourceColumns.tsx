import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useDescriptionColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { LastJobTooltip } from '../inventorySources/InventorySourceDetails';

export function useInventorySourceColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { data, error, isLoading } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources/`
  );
  const sourceChoices: [string, string][] | undefined = data?.actions?.GET?.source?.choices;
  const nameTo = useCallback(
    (item: InventorySource) =>
      getPageUrl(AwxRoute.InventorySourceDetail, {
        params: {
          inventory_type: 'inventory',
          id: item.inventory.toString(),
          source_id: item.id,
        },
      }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
  const descriptionColumn = useDescriptionColumn();
  const typeColumn = useMemo<ITableColumn<InventorySource>>(
    () => ({
      header: t('Type'),
      type: 'text',
      value: (inventorySource: InventorySource) => {
        if (error || isLoading) return;
        let value = '';
        sourceChoices?.find(([scMatch, label]) =>
          inventorySource.source === scMatch ? (value = label) : null
        );
        return value;
      },
      card: 'subtitle',
      list: 'subtitle',
    }),
    [t, error, isLoading, sourceChoices]
  );
  const statusColumn = useMemo<ITableColumn<InventorySource>>(
    () => ({
      header: t('Last job status'),
      cell: (inventorySource: InventorySource) => {
        return (
          <Link
            to={getPageUrl(AwxRoute.JobOutput, {
              params: {
                id: inventorySource?.summary_fields?.last_job?.id,
                job_type: 'inventory',
              },
            })}
          >
            <StatusCell
              tooltip={
                inventorySource.summary_fields.last_job ? (
                  <LastJobTooltip job={inventorySource?.summary_fields?.last_job} />
                ) : undefined
              }
              tooltipId={inventorySource.summary_fields.last_job?.id}
              status={inventorySource.status}
            />
          </Link>
        );
      },
    }),
    [t, getPageUrl]
  );
  const tableColumns = useMemo<ITableColumn<InventorySource>[]>(
    () => [nameColumn, descriptionColumn, statusColumn, typeColumn],
    [nameColumn, descriptionColumn, statusColumn, typeColumn]
  );
  return tableColumns;
}
