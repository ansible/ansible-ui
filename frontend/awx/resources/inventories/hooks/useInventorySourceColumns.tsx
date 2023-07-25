import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { StatusCell } from '../../../../common/Status';
import { useDescriptionColumn, useNameColumn } from '../../../../common/columns';
import { InventorySource } from '../../../interfaces/InventorySource';

import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';

export function useInventorySourceColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, error, isLoading } = useOptions<OptionsResponse<ActionsResponse>>(
    '/api/v2/inventory_sources/'
  );
  const nameClick = useCallback(
    (inventorySource: InventorySource) => {
      return navigate(
        RouteObj.InventoryDetails.replace(':id', inventorySource.inventory.toString()).replace(
          ':source_id',
          inventorySource.id.toString()
        )
      );
    },
    [navigate]
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
