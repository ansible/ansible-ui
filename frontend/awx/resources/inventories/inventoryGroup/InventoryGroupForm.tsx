import { useTranslation } from 'react-i18next';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useParams } from 'react-router-dom';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxError } from '../../../common/AwxError';
import { Inventory } from '../../../interfaces/Inventory';
import { GroupCreate } from '../../groups/GroupCreate';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { GroupEdit } from '../../groups/GroupEdit';

interface GroupFormPageHeaderProps {
  title: string;
  breadcrumbs: Array<keyof BreadCrumbs>;
  inventoryName?: string;
  groupName?: string;
  urlParams: Readonly<
    Partial<{
      inventory_type: string;
      group_id: string;
      id: string;
    }>
  >;
}

interface BreadCrumbLink {
  label: string;
  to: string;
}

type BreadCrumbs = Record<string, BreadCrumbLink>;

function GroupFormPageHeader(props: GroupFormPageHeaderProps) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const breadcrumbsParams = {
    id: { id: props.urlParams.id },
    inventory_type: { inventory_type: props.urlParams.inventory_type },
    group_id: { group_id: props.urlParams.group_id },
  };

  const breadcrumbsObj: BreadCrumbs = {
    inventories: { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
    inventory: {
      label: `${props.inventoryName}`,
      to: getPageUrl(AwxRoute.InventoryDetails, {
        params: { ...breadcrumbsParams.id, ...breadcrumbsParams.inventory_type },
      }),
    },
    groups: {
      label: t('Groups'),
      to: getPageUrl(AwxRoute.InventoryGroups, {
        params: { ...breadcrumbsParams.id, ...breadcrumbsParams.inventory_type },
      }),
    },
    group: {
      label: `${props.groupName}`,
      to: getPageUrl(AwxRoute.InventoryGroupDetails, {
        params: {
          ...breadcrumbsParams.id,
          ...breadcrumbsParams.inventory_type,
          ...breadcrumbsParams.group_id,
        },
      }),
    },
    relatedGroups: {
      label: t('Related groups'),
      to: getPageUrl(AwxRoute.InventoryGroupRelatedGroups, {
        params: {
          ...breadcrumbsParams.id,
          ...breadcrumbsParams.inventory_type,
          ...breadcrumbsParams.group_id,
        },
      }),
    },
  };

  return (
    <PageHeader
      title={props.title}
      breadcrumbs={props.breadcrumbs.map((breadcrumb) => breadcrumbsObj[breadcrumb])}
    />
  );
}

export function CreateGroup() {
  const { t } = useTranslation();
  const params = useParams<{ inventory_type: string; id: string }>();
  const {
    error,
    data: inventory,
    refresh,
  } = useGet<Inventory>(awxAPI`/inventories/${params.id?.toString() ?? ''}/`);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventory) return <LoadingPage breadcrumbs tabs />;

  const breadcrumbs: Array<keyof BreadCrumbs> = ['inventories', 'inventory', 'groups'];

  return (
    <PageLayout>
      <GroupFormPageHeader
        title={t('Create new group')}
        breadcrumbs={breadcrumbs}
        urlParams={params}
        inventoryName={inventory?.name}
      />
      <GroupCreate />
    </PageLayout>
  );
}

export function EditGroup() {
  const { t } = useTranslation();
  const params = useParams<{ inventory_type: string; group_id: string }>();
  const {
    error,
    data: group,
    refresh,
  } = useGet<InventoryGroup>(awxAPI`/groups/${params.group_id?.toString() ?? ''}/`);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!group) return <LoadingPage breadcrumbs tabs />;

  const breadcrumbs: Array<keyof BreadCrumbs> = ['inventories', 'inventory', 'groups', 'group'];

  return (
    <PageLayout>
      <GroupFormPageHeader
        title={t('Edit group')}
        breadcrumbs={breadcrumbs}
        urlParams={params}
        inventoryName={group?.summary_fields.inventory.name}
        groupName={group?.name}
      />
      <GroupEdit />
    </PageLayout>
  );
}

export function CreateRelatedGroup() {
  const { t } = useTranslation();
  const params = useParams<{ inventory_type: string; group_id: string; id: string }>();
  const {
    error,
    data: inventoryGroup,
    refresh,
  } = useGetItem<InventoryGroup>(awxAPI`/groups/`, params.group_id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventoryGroup) return <LoadingPage breadcrumbs tabs />;

  const breadcrumbs: Array<keyof BreadCrumbs> = [
    'inventories',
    'inventory',
    'groups',
    'group',
    'relatedGroups',
  ];

  return (
    <PageLayout>
      <GroupFormPageHeader
        title={t('Create new group')}
        breadcrumbs={breadcrumbs}
        urlParams={params}
        inventoryName={inventoryGroup?.summary_fields.inventory.name}
        groupName={inventoryGroup?.name}
      />
      <GroupCreate />
    </PageLayout>
  );
}
