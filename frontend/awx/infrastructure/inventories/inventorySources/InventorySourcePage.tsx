import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useInventorySourceActions } from '../hooks/useInventorySourceActions';

export function InventorySourcePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; source_id: string }>();
  const {
    data: inventorySource,
    error,
    refresh,
  } = useGetItem<InventorySource>(awxAPI`/inventory_sources/`, params.source_id);
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const itemActions = useInventorySourceActions({
    onInventorySourcesDeleted: () =>
      pageNavigate(AwxRoute.InventorySources, {
        params: { id: params.id, inventory_type: params.inventory_type },
      }),
  });
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventorySource) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={inventorySource?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventorySource?.summary_fields.inventory.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventorySource?.summary_fields.inventory.id,
                inventory_type: 'inventory',
              },
            }),
          },
          {
            label: t('Inventory Sources'),
            to: getPageUrl(AwxRoute.InventorySources, {
              params: { id: params.id, inventory_type: params.inventory_type },
            }),
          },
          {
            label: inventorySource?.name,
            to: getPageUrl(AwxRoute.InventorySourceDetail, {
              params: {
                id: params.id,
                inventory_type: params.inventory_type,
                source_id: params.source_id,
              },
            }),
          },
        ]}
        headerActions={
          <PageActions<InventorySource>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={inventorySource}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Inventory Sources'),
          page: AwxRoute.InventorySources,
          persistentFilterKey: 'inventory_sources',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InventorySourceDetail },
          { label: t('Schedules'), page: AwxRoute.InventorySourceSchedules },
          { label: t('Notifications'), page: AwxRoute.InventorySourceNotifications },
        ]}
        params={params}
      />
    </PageLayout>
  );
}
