import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { useInventorySourceActions } from '../hooks/useInventorySourceActions';
import { AwxRoute } from '../../../AwxRoutes';
import { InventorySource } from '../../../interfaces/InventorySource';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PageErrorState } from '../../../../../framework/components/PageErrorState';

export function InventorySourcePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; source_id: string }>();
  const {
    data: inventorySource,
    error,
    refresh,
  } = useGetItem<InventorySource>('/api/v2/inventory_sources/', params.source_id);
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const itemActions = useInventorySourceActions({
    onInventorySourcesDeleted: () =>
      pageNavigate(AwxRoute.InventorySources, {
        params: { id: params.id, inventory_type: params.inventory_type },
      }),
  });
  if (error) return <PageErrorState error={error} handleRefresh={refresh} />;
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
              params: { id: inventorySource?.summary_fields.inventory.id },
            }),
          },
          {
            label: t('Inventory Sources'),
            to: getPageUrl(AwxRoute.InventorySources, {
              params: { id: params.id, inventory_type: params.inventory_type },
            }),
          },
          { label: inventorySource?.name },
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
