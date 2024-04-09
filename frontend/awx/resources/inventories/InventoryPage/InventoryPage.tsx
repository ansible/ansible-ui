/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxError } from '../../../common/AwxError';
import { InventoryWithSource } from './InventoryDetails';
import { useCallback } from 'react';
import { useAwxWebSocketSubscription } from '../../../common/useAwxWebSocket';
import { useMemo } from 'react';

export function InventoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string }>();

  const urlType =
    params.inventory_type === 'constructed_inventory' ? 'constructed_inventories' : 'inventories';

  const location = useLocation();
  const getDetailsPageUrl = useGetPageUrl();
  const pageUrl = getDetailsPageUrl(AwxRoute.InventoryDetails, {
    params: { inventory_type: params.inventory_type, id: params.id },
  });
  const detail = location.pathname === pageUrl;

  const inventoryRequest = useGet<InventoryWithSource>(awxAPI`/${urlType}/${params.id || ''}/`);
  const inventoryData = inventoryRequest?.data;
  const inventorySourceUrl =
    inventoryData?.kind === 'constructed' && detail === true
      ? awxAPI`/inventories/${params.id ?? ''}/inventory_sources/`
      : '';

  const inventorySourceRequest = useGet<AwxItemsResponse<InventorySource>>(inventorySourceUrl);
  const inventorySourceData = inventorySourceRequest.data?.results[0];

  const inventory = useMemo<InventoryWithSource | undefined>(() => {
    if (inventoryData) {
      return { ...inventoryData, source: inventorySourceData };
    } else {
      return undefined;
    }
  }, [inventoryData, inventorySourceData]);

  const refresh = inventorySourceRequest.refresh;

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
            case 'workflow_job':
            case 'project_update':
            case 'inventory_update':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
  );
  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  const pageNavigate = usePageNavigate();

  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => pageNavigate(AwxRoute.Inventories),
    detail,
  });
  const getPageUrl = useGetPageUrl();
  const isSmartInventory = inventory?.kind === 'smart';
  const isConstructedInventory = inventory?.kind === 'constructed';

  if (inventorySourceRequest.error) {
    return <AwxError error={inventorySourceRequest.error} />;
  }

  if (inventoryRequest.error) {
    return <AwxError error={inventoryRequest.error} />;
  }

  if (
    !inventoryRequest.data ||
    (!inventorySourceRequest.data &&
      params.inventory_type === 'constructed_inventory' &&
      detail === true)
  ) {
    return <LoadingPage></LoadingPage>;
  }

  return (
    <PageLayout>
      <PageHeader
        title={inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: inventory?.name },
        ]}
        headerActions={
          <PageActions<Inventory>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventory}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Inventories'),
          page: AwxRoute.Inventories,
          persistentFilterKey: 'inventories',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InventoryDetails },
          { label: t('Access'), page: AwxRoute.InventoryAccess },
          !isSmartInventory && { label: t('Groups'), page: AwxRoute.InventoryGroups },
          { label: t('Hosts'), page: AwxRoute.InventoryHosts },
          !isSmartInventory &&
            !isConstructedInventory && { label: t('Sources'), page: AwxRoute.InventorySources },
          { label: t('Jobs'), page: AwxRoute.InventoryJobs },
          { label: t('Job templates'), page: AwxRoute.InventoryJobTemplates },
        ]}
        params={params}
        componentParams={{ inventory }}
      />
    </PageLayout>
  );
}

export function useGetInventory(id?: string, inventory_type?: string) {
  const path =
    inventory_type === 'constructed_inventory' ? 'constructed_inventories' : 'inventories';
  const { data: job } = useGet<Inventory>(id ? awxAPI`/${path}/${id}/` : '');
  return job;
}
