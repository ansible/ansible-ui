/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../common/Routes';
import { useGet } from '../../../../common/crud/useGet';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { InventoryDetails } from './InventoryDetails';
import { AwxRoute } from '../../../AwxRoutes';
import { AccessList } from '../../../views/accessList/AccessList';
import { AwxError } from '../../../common/AwxError';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';

export function InventoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string }>();
  const inventoryResponse = useGetInventory(params.id, params.inventory_type);
  const navigate = useNavigate();
  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => navigate(RouteObj.Inventories),
  });
  const getPageUrl = useGetPageUrl();

  if (inventoryResponse.error)
    return <AwxError error={inventoryResponse.error} handleRefresh={inventoryResponse.refresh} />;
  if (!inventoryResponse.inventory) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={inventoryResponse.inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: inventoryResponse.inventory?.name },
        ]}
        headerActions={
          <PageActions<Inventory>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventoryResponse.inventory}
          />
        }
      />
      <RoutedTabs isLoading={!inventoryResponse.inventory} baseUrl={RouteObj.InventoryPage}>
        <PageBackTab
          label={t('Back to Inventories')}
          url={RouteObj.Inventories}
          persistentFilterKey="inventories"
        />
        <RoutedTab label={t('Details')} url={RouteObj.InventoryDetails}>
          <InventoryDetails inventory={inventoryResponse.inventory} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.InventoryAccess}>
          <AccessList sublistEndpoint={inventoryResponse.inventory.related.access_list} />
        </RoutedTab>
        {inventoryResponse.inventory?.kind !== 'smart' && (
          <RoutedTab label={t('Groups')} url={RouteObj.InventoryGroups}>
            <PageNotImplemented />
          </RoutedTab>
        )}
        <RoutedTab label={t('Hosts')} url={RouteObj.InventoryHosts}>
          <PageNotImplemented />
        </RoutedTab>
        {inventoryResponse.inventory?.kind === '' && (
          <RoutedTab label={t('Sources')} url={RouteObj.InventorySources}>
            <PageNotImplemented />
          </RoutedTab>
        )}
        <RoutedTab label={t('Jobs')} url={RouteObj.InventoryJobs}>
          <PageNotImplemented />
        </RoutedTab>
        <RoutedTab label={t('Job templates')} url={RouteObj.InventoryJobTemplates}>
          <PageNotImplemented />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}

function useGetInventory(id?: string, inventory_type?: string) {
  const path =
    inventory_type === 'constructed_inventory' ? 'constructed_inventories' : 'inventories';
  const { data: job, error, refresh } = useGet<Inventory>(id ? `/api/v2/${path}/${id}/` : '');
  return { inventory: job, error, refresh };
}
