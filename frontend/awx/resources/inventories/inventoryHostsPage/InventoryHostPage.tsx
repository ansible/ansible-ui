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
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoriesHostsActions } from '../hooks/useInventoriesHostsActions';
import { useGetInventory } from '../InventoryPage/InventoryPage';
import { useGetHost } from '../../hosts/hooks/useGetHost';

export function InventoryHostPage() {
  const { t } = useTranslation();
  const params = useParams<{
    id: string;
    inventory_type: string;
    host_id: string;
  }>();

  const inventory = useGetInventory(params.id, params.inventory_type);
  const { host, refresh } = useGetHost(params.host_id as string);
  const pageNavigate = usePageNavigate();

  const itemActions = useInventoriesHostsActions((_host) => {
    pageNavigate(AwxRoute.InventoryHosts, {
      params: { inventory_type: params.inventory_type, id: params.id },
    });
  }, refresh);

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
              params: { id: params.id, inventory_type: params.inventory_type },
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
          <PageActions<AwxHost>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={host as AwxHost}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Hosts'),
          page: AwxRoute.InventoryHosts,
          persistentFilterKey: 'inventories',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InventoryHostDetails },
          { label: t('Groups'), page: AwxRoute.InventoryHostGroups },
        ]}
        params={params}
      />
    </PageLayout>
  );
}
