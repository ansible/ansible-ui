import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../common/crud/useGet';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { awxAPI } from '../../common/api/awx-utils';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../../framework';
import { AwxError } from '../../common/AwxError';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useInventoriesGroupActions } from '../inventories/hooks/useInventoriesGroupActions';

export function GroupPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; group_id: string }>();
  const {
    error,
    data: inventoryGroup,
    refresh,
  } = useGetItem<InventoryGroup>(awxAPI`/groups/`, params.group_id);

  const getPageUrl = useGetPageUrl();

  const actions = useInventoriesGroupActions();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventoryGroup) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={inventoryGroup?.name}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventoryGroup?.summary_fields.inventory.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventoryGroup?.inventory,
                inventory_type: params.inventory_type,
              },
            }),
          },
          {
            label: t('Groups'),
            to: getPageUrl(AwxRoute.InventoryGroups, {
              params: {
                id: inventoryGroup?.inventory,
                inventory_type: params.inventory_type,
              },
            }),
          },
          { label: inventoryGroup?.name },
        ]}
        headerActions={
          <PageActions<InventoryGroup>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={inventoryGroup}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Groups'),
          page: AwxRoute.InventoryGroups,
          persistentFilterKey: 'groups',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.InventoryGroupDetails },
          { label: t('Related Groups'), page: AwxRoute.InventoryGroupRelatedGroups },
          { label: t('Hosts'), page: AwxRoute.InventoryGroupHost },
        ]}
        params={{
          id: inventoryGroup.inventory,
          inventory_type: params.inventory_type,
          group_id: inventoryGroup.id,
        }}
      />
    </PageLayout>
  );
}
