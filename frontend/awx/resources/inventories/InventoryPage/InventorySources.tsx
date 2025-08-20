import { PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageLoadingTable } from '@ansible/ansible-ui-framework/PageTable/PageLoadingTable';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { InventorySource } from '../../../interfaces/InventorySource';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoriesSourcesToolbarActions } from '../hooks/useInventoriesSourcesToolbarActions';
import { useInventorySourceActions } from '../hooks/useInventorySourceActions';
import { useInventorySourceColumns } from '../hooks/useInventorySourceColumns';
import { useInventorySourceFilters } from '../hooks/useInventorySourceFilters';

type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  inventory_id?: number;
};

export function InventorySources() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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

  const { data: sourceOptions, isLoading: isLoadingSourceOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(awxAPI`/inventory_sources/`);
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

  if (isLoadingSourceOptions) return <PageLoadingTable />;

  return (
    <PageLayout>
      <PageTable<InventorySource>
        id="awx-inventory-sources-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading inventory sources')}
        emptyState={
          canCreateSource ? (
            <PageTableEmptyState
              title={t('There are currently no sources added to this inventory.')}
              description={t('Please create a source by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(AwxRoute.InventorySourcesAdd, {
                  params: { id: params.id, inventory_type: params.inventory_type },
                })}
              >
                {t('Create source')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a host')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
