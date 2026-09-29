import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { useDescriptionColumn, useNameColumn } from '@ansible/common-ui/columns';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { getSyncJobId } from '../../../common/getSyncJobId';
import { InventorySource } from '../../../interfaces/InventorySource';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { LastJobTooltip } from '../inventorySources/InventorySourceDetails';

type InventorySourceLike = {
  status?: string;
  summary_fields?: {
    current_job?: { id?: number; status?: string; finished?: string };
    last_job?: { id?: number; status?: string; finished?: string };
    current_update?: { id?: number };
  };
  related?: { last_job?: string };
};

export function buildInventorySourceStatusCellProps(
  inventorySource: InventorySourceLike,
  getPageUrl: (route: string, config: { params: Record<string, string | number> }) => string,
  disableLinks?: boolean
) {
  const lastJob = inventorySource.summary_fields?.current_job?.id
    ? inventorySource.summary_fields.current_job
    : inventorySource.summary_fields?.last_job;
  const jobId = getSyncJobId(inventorySource.summary_fields, inventorySource.related?.last_job);
  const jobOutputUrl =
    jobId !== undefined && !disableLinks
      ? getPageUrl(AwxRoute.JobOutput, {
          params: {
            id: jobId,
            job_type: 'inventory',
          },
        })
      : undefined;

  return {
    tooltip: lastJob?.id ? (
      <LastJobTooltip job={lastJob as { id: number; status: string; finished: string }} />
    ) : undefined,
    tooltipId: lastJob?.id,
    status: inventorySource.status,
    to: jobOutputUrl,
    disableLinks,
  };
}

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
        const props = buildInventorySourceStatusCellProps(
          inventorySource,
          getPageUrl,
          options?.disableLinks
        );
        return <StatusCell {...props} />;
      },
    }),
    [t, getPageUrl, options?.disableLinks]
  );
  const tableColumns = useMemo<ITableColumn<InventorySource>[]>(
    () => [nameColumn, descriptionColumn, statusColumn, typeColumn],
    [nameColumn, descriptionColumn, statusColumn, typeColumn]
  );
  return tableColumns;
}
