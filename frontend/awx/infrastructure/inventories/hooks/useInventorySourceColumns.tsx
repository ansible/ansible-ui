import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';
import { useDescriptionColumn, useNameColumn } from '../../../../common/columns';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInventorySourceColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const { data, error, isLoading } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources/`
  );
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (inventorySource: InventorySource) => {
      return pageNavigate(AwxRoute.InventorySourceDetail, {
        params: {
          inventory_type: 'inventory',
          id: inventorySource.inventory.toString(),
          source_id: inventorySource.id,
        },
      });
    },
    [pageNavigate]
  );
  const sourceChoices: [string, string][] | undefined = data?.actions?.GET?.source?.choices;
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
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
      header: t('Status'),
      cell: (inventorySource: InventorySource) => {
        return <StatusCell status={inventorySource.status} />;
      },
    }),
    [t]
  );
  const tableColumns = useMemo<ITableColumn<InventorySource>[]>(
    () => [nameColumn, descriptionColumn, statusColumn, typeColumn],
    [nameColumn, descriptionColumn, statusColumn, typeColumn]
  );
  return tableColumns;
}
