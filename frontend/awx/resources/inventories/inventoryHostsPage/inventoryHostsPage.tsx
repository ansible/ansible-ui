/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useEffect, useState } from 'react';
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
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventoriesHostsActions } from '../hooks/useInventoriesHostsActions';
import { useGetInventory } from '../InventoryPage/InventoryPage';

export function InventoryHostsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const inventory = useGetInventory(params.id, params.inventory_type);
  const hostResponse = useGetInventoryHost(params.id, params.host_id);
  const pageNavigate = usePageNavigate();

  const [host, setHost] = useState<AwxHost | undefined>(hostResponse);

  useEffect(() => {
    setHost(hostResponse);
  }, [hostResponse]);

  const itemActions = useInventoriesHostsActions(
    (_host: AwxHost[]) => {
      pageNavigate(AwxRoute.InventoryHosts, {
        params: { inventory_type: params.inventory_type, id: params.id },
      });
    },
    setHost,
    false
  );

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
            label: t(`${(host as AwxHost)?.name}`),
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

export function useGetInventoryHost(inventory_id?: string, host_id?: string) {
  const { data: host } = useGet<{ results: AwxHost[] }>(
    inventory_id ? awxAPI`/inventories/${inventory_id}/hosts/` : '',
    {
      id: host_id ?? '',
    }
  );
  return host?.results[0];
}
