/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
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

export function InventoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);
  const pageNavigate = usePageNavigate();
  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => pageNavigate(AwxRoute.Inventories), detail : true
  });
  const getPageUrl = useGetPageUrl();
  const isSmartInventory = inventory?.kind === 'smart';

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
          !isSmartInventory && { label: t('Sources'), page: AwxRoute.InventorySources },
          { label: t('Jobs'), page: AwxRoute.InventoryJobs },
          { label: t('Job templates'), page: AwxRoute.InventoryJobTemplates },
        ]}
        params={params}
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
