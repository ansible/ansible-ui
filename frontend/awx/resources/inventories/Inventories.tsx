import { useCallback } from 'react';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { type Inventory } from '../../interfaces/Inventory';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useAwxView } from '../../useAwxView';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useInventoriesColumns } from './hooks/useInventoriesColumns';
import { useInventoriesFilters } from './hooks/useInventoriesFilters';
import { useInventoriesToolbarActions } from './hooks/useInventoriesToolbarActions';

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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/inventories/');
  const canCreateInventory = Boolean(data && data.actions && data.actions['POST']);
  const toolbarFilters = useInventoriesFilters();
  const tableColumns = useInventoriesColumns();
  const view = useAwxView<Inventory>({
    url: '/api/v2/inventories/',
    toolbarFilters,
    tableColumns,
  });
  const { refresh, pageItems } = view;
  const toolbarActions = useInventoriesToolbarActions(view);
  const rowActions = useInventoryActions({ onInventoriesDeleted: view.unselectItemsAndRefresh });

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
        titleHelpTitle={t('Inventories')}
        titleHelp={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/inventories.html"
        description={t(
          'An inventory defines the hosts and groups of hosts upon which commands, modules, and tasks in a playbook operate.'
        )}
      />
      <PageTable<Inventory>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        expandedRow={ItemDescriptionExpandedRow<Inventory>}
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
                'Please contact your Organization Administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateInventory ? undefined : CubesIcon}
        emptyStateActions={canCreateInventory ? toolbarActions.slice(0, 1) : undefined}
        {...view}
      />
    </PageLayout>
  );
}
