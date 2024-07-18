import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable, usePageNavigate } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { InventorySource } from '../../../interfaces/InventorySource';
import { OptionsResponse, ActionsResponse } from '../../../interfaces/OptionsResponse';
import { useAwxView } from '../../../common/useAwxView';
import { useInventorySourceFilters } from '../hooks/useInventorySourceFilters';
import { useInventoriesSourcesToolbarActions } from '../hooks/useInventoriesSourcesToolbarActions';
import { useInventorySourceActions } from '../hooks/useInventorySourceActions';
import { useInventorySourceColumns } from '../hooks/useInventorySourceColumns';
import { useCallback } from 'react';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';

type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
};

export function InventorySources() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const tableColumns = useInventorySourceColumns();
  const params = useParams<{ id: string; inventory_type: string }>();
  const toolbarFilters = useInventorySourceFilters(
    `inventories/${params.id ?? ''}/inventory_sources/`
  );
  const view = useAwxView<InventorySource>({
    url: awxAPI`/inventories/${params.id ?? ''}/inventory_sources/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useInventoriesSourcesToolbarActions(view, params.id || '');
  const rowActions = useInventorySourceActions({
    onInventorySourcesDeleted: view.unselectItemsAndRefresh,
    onInvUpdateCanceled: view.unselectItemsAndRefresh,
  });

  const sourceOptions = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/inventory_sources/`
  ).data;
  const canCreateSource = Boolean(
    sourceOptions && sourceOptions.actions && sourceOptions.actions['POST']
  );

  usePersistentFilters('inventories');

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      if (!message?.inventory_id) return;
      switch (message?.group_name) {
        case 'inventories':
          switch (message?.status) {
            case 'deleted':
              void view.refresh();
              break;
          }
          break;
        case 'jobs':
          switch (message?.type) {
            case 'inventory_update':
              void view.refresh();
              break;
          }
          break;
      }
    },
    [view]
  );

  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'], inventories: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  return (
    <PageLayout>
      <PageTable<InventorySource>
        id="awx-inventory-sources-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventory sources')}
        emptyStateTitle={
          canCreateSource
            ? t('There are currently no sources added to this inventory.')
            : t('You do not have permission to create a host')
        }
        emptyStateDescription={
          canCreateSource
            ? t('Please create a source by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateSource ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateSource ? t('Create source') : undefined}
        emptyStateButtonClick={
          canCreateSource
            ? () =>
                pageNavigate(AwxRoute.InventorySourcesAdd, {
                  params: { id: params.id, inventory_type: params.inventory_type },
                })
            : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
