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
import { CreateSchedule } from '../../views/schedules/ScheduleForm';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';
import { SchedulePage } from '../../views/schedules/SchedulePage/SchedulePage';
import { ScheduleRules } from '../../views/schedules/SchedulePage/ScheduleRules';
import { Schedules } from '../../views/schedules/Schedules';
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
import { CreateInventorySource } from '../../resources/sources/InventorySourceForm';
import {
  CreateHost,
  EditHost,
} from '../../resources/inventories/inventoryHostsPage/InventoryHostForm';
import { GroupDetails } from '../../resources/groups/GroupDetails';
import { InventoryHostJobs } from '../../resources/inventories/inventoryHostsPage/InventoryHostJobs';
import { InventoryHostFacts } from '../../resources/inventories/inventoryHostsPage/InventoryHostFacts';
import { GroupRelatedGroups } from '../../resources/groups/GroupRelatedGroups';

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
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventorySourceSchedules,
              path: 'schedules',
              element: <Schedules sublistEndpoint={awxAPI`/inventory_sources`} />,
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
              path: 'hosts',
              element: <PageNotImplemented />,
            },
          ],
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
          element: <PageNotImplemented />,
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
