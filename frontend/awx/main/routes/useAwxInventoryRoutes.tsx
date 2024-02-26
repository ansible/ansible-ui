import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { ResourceNotifications } from '../../administration/job-notifications/notifications/ResourceNotifications';
import { awxAPI } from '../../common/api/awx-utils';
import { Inventories } from '../../infrastructure/inventories/Inventories';
import { CreateInventory, EditInventory } from '../../infrastructure/inventories/InventoryForm';
import { InventoryDetails } from '../../infrastructure/inventories/InventoryPage/InventoryDetails';
import { InventoryGroups } from '../../infrastructure/inventories/InventoryPage/InventoryGroups';
import { InventoryHosts } from '../../infrastructure/inventories/InventoryPage/InventoryHosts';
import { InventoryJobTemplates } from '../../infrastructure/inventories/InventoryPage/InventoryJobTemplates';
import { InventoryPage } from '../../infrastructure/inventories/InventoryPage/InventoryPage';
import { InventorySources } from '../../infrastructure/inventories/InventoryPage/InventorySources';
import { GroupDetails } from '../../infrastructure/inventories/groups/GroupDetails';
import { GroupHosts } from '../../infrastructure/inventories/groups/GroupHosts';
import { GroupPage } from '../../infrastructure/inventories/groups/GroupPage';
import { GroupRelatedGroups } from '../../infrastructure/inventories/groups/GroupRelatedGroups';
import {
  CreateGroup,
  CreateRelatedGroup,
  EditGroup,
} from '../../infrastructure/inventories/inventoryGroup/InventoryGroupForm';
import { InventoryHostDetails } from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostDetails';
import { InventoryHostFacts } from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostFacts';
import {
  CreateHost,
  EditHost,
} from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostForm';
import { InventoryHostGroups } from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostGroups';
import { InventoryHostJobs } from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostJobs';
import { InventoryHostPage } from '../../infrastructure/inventories/inventoryHostsPage/InventoryHostPage';
import { InventorySourceDetails } from '../../infrastructure/inventories/inventorySources/InventorySourceDetails';
import { InventorySourcePage } from '../../infrastructure/inventories/inventorySources/InventorySourcePage';
import {
  CreateInventorySource,
  EditInventorySource,
} from '../../infrastructure/inventories/sources/InventorySourceForm';
import { CreateSchedule } from '../../schedules/ScheduleForm';
import { ScheduleDetails } from '../../schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../schedules/SchedulePage/SchedulePage';
import { ScheduleRules } from '../../schedules/SchedulePage/ScheduleRules';
import { SchedulesList } from '../../schedules/SchedulesList';
import { AwxRoute } from '../AwxRoutes';

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
                {
                  label: t('Rules'),
                  page: AwxRoute.InventorySourceScheduleRules,
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
            {
              id: AwxRoute.InventorySourceScheduleRules,
              path: 'rrules',
              element: <ScheduleRules />,
            },
          ],
        },
        {
          id: AwxRoute.InventorySourceScheduleCreate,
          path: ':inventory_type/:id/sources/:source_id/schedules/create',
          element: <CreateSchedule />,
        },
        {
          id: AwxRoute.InventorySourceScheduleEdit,
          path: ':inventory_type/:id/sources/:source_id/schedules/edit',
          element: <PageNotImplemented />,
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
              element: <PageNotImplemented />,
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
              element: <InventoryHostGroups />,
            },
            {
              id: AwxRoute.InventoryHostJobs,
              path: 'jobs',
              element: <InventoryHostJobs />,
            },
            {
              id: AwxRoute.InventoryHostFacts,
              path: 'facts',
              element: <InventoryHostFacts />,
            },
          ],
        },
        {
          id: AwxRoute.EditInventory,
          path: ':id/edit',
          element: <EditInventory />,
        },
        {
          id: AwxRoute.CreateInventory,
          path: 'create',
          element: <CreateInventory />,
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
