import { useTranslation } from 'react-i18next';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxError } from '../../../common/AwxError';
import { Inventory } from '../../../interfaces/Inventory';
import { GroupCreate } from '../../groups/GroupCreate';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { GroupEdit } from '../../groups/GroupEdit';

export function CreateGroup() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: inventory,
    refresh,
  } = useGet<Inventory>(awxAPI`/inventories/${params.id?.toString() ?? ''}`);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventory) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Create new group')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventory?.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventory?.id,
                inventory_type: 'inventory',
              },
            }),
          },
          {
            label: t('Groups'),
            to: getPageUrl(AwxRoute.InventoryGroups, {
              params: {
                id: inventory?.id,
                inventory_type: 'inventory',
              },
            }),
          },
        ]}
      />
      <GroupCreate inventory={inventory} />
    </PageLayout>
  );
}

export function EditGroup() {
  const { t } = useTranslation();
  const params = useParams<{ group_id: string }>();
  const {
    error,
    data: group,
    refresh,
  } = useGet<InventoryGroup>(awxAPI`/groups/${params.group_id?.toString() ?? ''}`);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!group) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit group')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${group?.summary_fields.inventory.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: group?.summary_fields.inventory.id,
                inventory_type: 'inventory',
              },
            }),
          },
          {
            label: t('Groups'),
            to: getPageUrl(AwxRoute.InventoryGroups, {
              params: {
                id: group?.summary_fields.inventory.id,
                inventory_type: 'inventory',
              },
            }),
          },
          {
            label: `${group?.name}`,
            to: getPageUrl(AwxRoute.InstanceGroupDetails, {
              params: {
                id: group?.summary_fields.inventory.id,
                inventory_type: 'inventory',
                group_id: group.id,
              },
            }),
          },
        ]}
      />
      <GroupEdit group={group} />
    </PageLayout>
  );
}
