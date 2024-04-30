import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { awxAPI } from '../../common/api/awx-utils';
import { Inventories } from '../../resources/inventories/Inventories';
import { CreateInventory, EditInventory } from '../../resources/inventories/InventoryForm';
import { InventoryDetails } from '../../resources/inventories/InventoryPage/InventoryDetails';
import { InventoryPage } from '../../resources/inventories/InventoryPage/InventoryPage';
import { InventorySourceDetails } from '../../resources/inventories/inventorySources/InventorySourceDetails';
import { InventorySourcePage } from '../../resources/inventories/inventorySources/InventorySourcePage';
import { ScheduleAddWizard } from '../../views/schedules/wizard/ScheduleAddWizard';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../views/schedules/SchedulePage/SchedulePage';
import { AwxRoute } from '../AwxRoutes';
import { InventoryJobTemplates } from '../../resources/inventories/InventoryPage/InventoryJobTemplates';
import { InventoryHosts } from '../../resources/inventories/InventoryPage/InventoryHosts';
import { InventorySources } from '../../resources/inventories/InventoryPage/InventorySources';
import { InventoryGroups } from '../../resources/inventories/InventoryPage/InventoryGroups';
import { GroupPage } from '../../resources/groups/GroupPage';
import { InventoryHostPage } from '../../resources/inventories/inventoryHostsPage/InventoryHostPage';
import { InventoryHostDetails } from '../../resources/inventories/inventoryHostsPage/InventoryHostDetails';
import {
  CreateGroup,
  EditGroup,
  CreateRelatedGroup,
} from '../../resources/inventories/inventoryGroup/InventoryGroupForm';
import { InventoryHostGroups } from '../../resources/inventories/inventoryHostsPage/InventoryHostGroups';
import {
  CreateInventorySource,
  EditInventorySource,
} from '../../resources/sources/InventorySourceForm';
import {
  CreateHost,
  EditHost,
} from '../../resources/inventories/inventoryHostsPage/InventoryHostForm';
import { GroupDetails } from '../../resources/groups/GroupDetails';
import { InventoryHostJobs } from '../../resources/inventories/inventoryHostsPage/InventoryHostJobs';
import { InventoryHostFacts } from '../../resources/inventories/inventoryHostsPage/InventoryHostFacts';
import { GroupHosts } from '../../resources/groups/GroupHosts';
import { GroupRelatedGroups } from '../../resources/groups/GroupRelatedGroups';
import { ResourceNotifications } from '../../resources/notifications/ResourceNotifications';
import { SchedulesList } from '../../views/schedules/SchedulesList';
import { InventoryJobs } from '../../resources/inventories/InventoryPage/InventoryJobs';
import { InventoryRunCommand } from '../../resources/inventories/InventoryRunCommand';
import { ScheduleEditWizard } from '../../views/schedules/wizard/ScheduleEditWizard';

export function useAwxInventoryRoutes() {
  const { t } = useTranslation();
  const inventoryRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Inventories,
      label: t('Inventories'),
      path: 'inventories',
      children: [
        {
          id: AwxRoute.InventorySourceSchedulePage,
          path: ':inventory_type/:id/sources/:source_id/schedules/:schedule_id/',
          element: (
            <SchedulePage
              initialBreadCrumbs={[
                { label: t('Inventories'), to: AwxRoute.Inventories },
                { id: 'inventory', to: AwxRoute.InventoryPage },
                { label: t('Inventory Sources'), to: AwxRoute.InventorySources },
                { id: 'data', to: AwxRoute.InventorySourcePage },
                { label: t('Schedules'), id: 'schedules', to: AwxRoute.InventorySourceSchedules },
              ]}
              backTab={{
                label: t('Back to Schedules'),
                page: AwxRoute.InventorySourceSchedules,
                persistentFilterKey: 'inventory-schedules',
              }}
              tabs={[
                {
                  label: t('Details'),
                  page: AwxRoute.InventorySourceScheduleDetails,
                },
              ]}
            />
          ),
          children: [
            {
              id: AwxRoute.InventorySourceScheduleDetails,
              path: 'details',
              element: <ScheduleDetails />,
            },
          ],
        },
        {
          id: AwxRoute.InventorySourceScheduleCreate,
          path: ':inventory_type/:id/sources/:source_id/schedules/create',
          element: <ScheduleAddWizard />,
        },
        {
          id: AwxRoute.InventorySourceScheduleEdit,
          path: ':inventory_type/:id/sources/:source_id/schedules/:schedule_id/edit',
          element: <ScheduleEditWizard />,
        },
        {
          id: AwxRoute.InventorySourcePage,
          path: ':inventory_type/:id/sources/:source_id',
          element: <InventorySourcePage />,
          children: [
            {
              id: AwxRoute.InventorySourceDetail,
              path: 'details',
              element: <InventorySourceDetails />,
            },
            {
              id: AwxRoute.InventorySourceNotifications,
              path: 'notifications',
              element: <ResourceNotifications resourceType="inventory_sources" />,
            },
            {
              id: AwxRoute.InventorySourceSchedules,
              path: 'schedules',
              element: <SchedulesList sublistEndpoint={awxAPI`/inventory_sources`} />,
            },
          ],
        },
        {
          id: AwxRoute.InventoryHostAdd,
          path: ':inventory_type/:id/add',
          element: <CreateHost />,
        },
        {
          id: AwxRoute.InventoryHostEdit,
          path: ':inventory_type/:id/host/:host_id/edit',
          element: <EditHost />,
        },
        {
          id: AwxRoute.InventoryGroupRelatedGroupsCreate,
          path: ':inventory_type/:id/groups/:group_id/nested_groups/add',
          element: <CreateRelatedGroup />,
        },
        {
          id: AwxRoute.InventoryRunCommand,
          path: ':inventory_type/:id/groups/:group_id/run_command',
          element: <InventoryRunCommand />,
        },
        {
          id: AwxRoute.InventoryGroupPage,
          path: ':inventory_type/:id/groups/:group_id',
          element: <GroupPage />,
          children: [
            {
              id: AwxRoute.InventoryGroupDetails,
              path: 'details',
              element: <GroupDetails />,
            },
            {
              id: AwxRoute.InventoryGroupRelatedGroups,
              path: 'nested_groups',
              element: <GroupRelatedGroups />,
            },
            {
              id: AwxRoute.InventoryGroupHost,
              path: 'nested_hosts',
              element: <GroupHosts />,
            },
          ],
        },
        {
          id: AwxRoute.InventoryGroupHostAdd,
          path: ':inventory_type/:id/group/:group_id/nested_hosts/add',
          element: <CreateHost />,
        },
        {
          id: AwxRoute.InventoryGroupEdit,
          path: ':inventory_type/:id/group/:group_id/edit',
          element: <EditGroup />,
        },
        {
          id: AwxRoute.InventoryGroupCreate,
          path: ':inventory_type/:id/group/add',
          element: <CreateGroup />,
        },
        {
          id: AwxRoute.InventoryPage,
          path: ':inventory_type/:id/',
          element: <InventoryPage />,
          children: [
            {
              id: AwxRoute.InventoryDetails,
              path: 'details',
              element: <InventoryDetails />,
            },
            {
              id: AwxRoute.InventoryAccess,
              path: 'access',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventoryGroups,
              path: 'groups',
              element: <InventoryGroups />,
            },
            {
              id: AwxRoute.InventoryHosts,
              path: 'hosts',
              element: <InventoryHosts />,
            },
            {
              id: AwxRoute.InventorySources,
              path: 'sources',
              element: <InventorySources />,
            },
            {
              id: AwxRoute.InventoryJobs,
              path: 'jobs',
              element: <InventoryJobs />,
            },
            {
              id: AwxRoute.InventoryJobTemplates,
              path: 'templates',
              element: <InventoryJobTemplates />,
            },
          ],
        },
        {
          id: AwxRoute.InventoryHostPage,
          path: ':inventory_type/:id/hosts/:host_id',
          element: <InventoryHostPage />,
          children: [
            {
              id: AwxRoute.InventoryHostDetails,
              path: 'details',
              element: <InventoryHostDetails />,
            },
            {
              id: AwxRoute.InventoryHostGroups,
              path: 'groups',
              element: <InventoryHostGroups page="inventory" />,
            },
            {
              id: AwxRoute.InventoryHostJobs,
              path: 'jobs',
              element: <InventoryHostJobs />,
            },
            {
              id: AwxRoute.InventoryHostFacts,
              path: 'facts',
              element: <InventoryHostFacts page="inventory" />,
            },
          ],
        },
        {
          id: AwxRoute.EditInventory,
          path: ':inventory_type/:id/edit',
          element: <EditInventory />,
        },
        {
          id: AwxRoute.CreateInventory,
          path: 'inventory/create',
          element: <CreateInventory inventoryKind="" />,
        },
        {
          id: AwxRoute.CreateSmartInventory,
          path: 'smart_inventory/create',
          element: <CreateInventory inventoryKind="smart" />,
        },
        {
          id: AwxRoute.CreateConstructedInventory,
          path: 'constructed_inventory/create',
          element: <CreateInventory inventoryKind="constructed" />,
        },
        {
          path: '',
          element: <Inventories />,
        },
        {
          id: AwxRoute.InventorySourceEdit,
          path: ':inventory_type/:id/sources/:source_id/edit',
          element: <EditInventorySource />,
        },
        {
          id: AwxRoute.InventorySourcesAdd,
          path: ':inventory_type/:id/sources/add',
          element: <CreateInventorySource />,
        },
      ],
    }),
    [t]
  );
  return inventoryRoutes;
}
