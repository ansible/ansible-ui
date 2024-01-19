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
import { AwxHost } from '../../../interfaces/AwxHost';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoryActions } from '../hooks/useInventoryActions';
import { useGetInventory } from '../InventoryPage/InventoryPage';

export function InventoryHostsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);
  const host = useGetInventoryHost(params.id, params.host_id);
  const pageNavigate = usePageNavigate();
  const itemActions = useInventoryActions({
    onInventoriesDeleted: () => pageNavigate(AwxRoute.Inventories),
  });
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Host Details')}
        breadcrumbs={[
          {
            label: t('Inventories'),
            to: getPageUrl(AwxRoute.Inventories),
          },
          {
            label: t(`${inventory?.name}`),
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params,
            }),
          },
          {
            label: t('Hosts'),
            to: getPageUrl(AwxRoute.InventoryHosts, {
              params: { id: params.id, inventory_type: params.inventory_type },
            }),
          },
          {
            label: t(`${host?.name}`),
          },
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
          label: t('Back to Hosts'),
          page: AwxRoute.InventoryHosts,
          persistentFilterKey: 'inventories',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.InventoryHostDetails }]}
        params={params}
      />
    </PageLayout>
  );
}

export function useGetInventoryHost(inventory_id?: string, host_id?: string) {
  const { data: host } = useGet<{ results: AwxHost[] }>(
    inventory_id ? awxAPI`/inventories/${inventory_id}/hosts/` : '',
    {
      id: host_id ?? '',
    }
  );
  return host?.results[0];
}
