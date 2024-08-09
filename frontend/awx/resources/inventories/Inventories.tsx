import { CubesIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { type Inventory } from '../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useInventoriesColumns } from './hooks/useInventoriesColumns';
import { useInventoriesFilters } from './hooks/useInventoriesFilters';
import { useInventoriesToolbarActions } from './hooks/useInventoriesToolbarActions';
import { useInventoryActions } from './hooks/useInventoryActions';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';

export type WebSocketInventory = {
  status: string;
} & Inventory;

type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
};

export function Inventories() {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventories/`);
  const canCreateInventory = Boolean(data && data.actions && data.actions['POST']);
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns();
  const view = useAwxView<Inventory>({
    url: awxAPI`/inventories/`,
    toolbarFilters,
    tableColumns,
  });
  const { refresh, pageItems } = view;
  const toolbarActions = useInventoriesToolbarActions(view);
  const rowActions = useInventoryActions({
    onInventoriesDeleted: view.unselectItemsAndRefresh,
    onInventoryCopied: view.refresh,
    detail: false,
  });
  usePersistentFilters('inventories');
  const config = useAwxConfig();

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      if (!message?.inventory_id) return;
      switch (message?.group_name) {
        case 'inventories':
          switch (message?.status) {
            case 'deleted':
              void refresh();
              break;
          }
          break;
        case 'jobs':
          switch (message?.type) {
            case 'inventory_update':
              switch (message?.status) {
                case 'canceled':
                case 'error':
                case 'failed':
                case 'pending':
                case 'running':
                case 'successful': {
                  const wsInventory = (pageItems ?? []).find(
                    (inv) => inv.id === message.inventory_id
                  );
                  if (!wsInventory) return;
                  (wsInventory as WebSocketInventory).status = message.status;
                  break;
                }
              }
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh, pageItems]
  );

  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'], inventories: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Inventories')}
        titleHelpTitle={t('Inventory')}
        titleHelp={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
        titleDocLink={useGetDocsUrl(config, 'inventories')}
        description={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
        headerActions={<ActivityStreamIcon type={'inventory'} />}
      />
      <PageTable<Inventory>
        id="awx-inventories-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventories')}
        emptyStateTitle={
          canCreateInventory
            ? t('There are currently no inventories added.')
            : t('You do not have permission to create an inventory.')
        }
        emptyStateDescription={
          canCreateInventory
            ? t('Please create an inventory by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateInventory ? undefined : CubesIcon}
        emptyStateActions={canCreateInventory ? toolbarActions.slice(0, 1) : undefined}
        {...view}
        defaultSubtitle={t('Inventory')}
      />
    </PageLayout>
  );
}
