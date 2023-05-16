/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { RoutedTabs, RoutedTab, PageBackTab } from '../../../../common/RoutedTabs';
import { RouteObj } from '../../../../Routes';
import { PageNotImplemented } from '../../../../common/PageNotImplemented';
import { useGet } from '../../../../common/crud/useGet';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { InventoryDetails } from './InventoryDetails';

export function InventoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);
  const navigate = useNavigate();
  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => navigate(RouteObj.Inventories),
  });
  return (
    <PageLayout>
      <PageHeader
        title={inventory?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteObj.Inventories },
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
      <RoutedTabs isLoading={!inventory} baseUrl={RouteObj.InventoryPage}>
        <PageBackTab
          label={t('Back to Inventories')}
          url={RouteObj.Inventories}
          persistentFilterKey="inventories"
        />
        <RoutedTab label={t('Details')} url={RouteObj.InventoryDetails}>
          <InventoryDetails inventory={inventory!} />
        </RoutedTab>
        <RoutedTab label={t('Access')} url={RouteObj.InventoryAccess}>
          <PageNotImplemented />
        </RoutedTab>
        {inventory?.kind !== 'smart' && (
          <RoutedTab label={t('Groups')} url={RouteObj.InventoryGroups}>
            <PageNotImplemented />
          </RoutedTab>
        )}
        <RoutedTab label={t('Hosts')} url={RouteObj.InventoryHosts}>
          <PageNotImplemented />
        </RoutedTab>
        {inventory?.kind !== 'constructed' && (
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
  const { data: job } = useGet<Inventory>(id ? `/api/v2/${path}/${id}/` : '');
  return job;
}
