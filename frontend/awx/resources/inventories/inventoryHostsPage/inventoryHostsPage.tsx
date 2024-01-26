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
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoriesHostsActions } from '../hooks/useInventoriesHostsActions';
import { useGetInventory } from '../InventoryPage/InventoryPage';

export function InventoryHostsPage() {
  const { t } = useTranslation();
  const params = useParams<{
    id: string;
    inventory_type: string;
    host_id: string;
  }>();

  const inventory = useGetInventory(params.id, params.inventory_type);
  const { host, refresh } = useGetInventoryHost(params.host_id as string);
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
        tabs={[{ label: t('Details'), page: AwxRoute.InventoryHostDetails }]}
        params={params}
      />
    </PageLayout>
  );
}

export function useGetInventoryHost(host_id: string) {
  const { data: host, refresh } = useGetItem<AwxHost>(awxAPI`/hosts`, host_id.toString());
  return { host, refresh };
}
