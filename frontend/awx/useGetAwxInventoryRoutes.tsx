import { useTranslation } from 'react-i18next';
import { AwxRoute } from './AwxRoutes';
import { CreateInventory, EditInventory } from './resources/inventories/InventoryForm';
import { CreateSchedule } from './views/schedules/ScheduleForm';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { SchedulePage } from './views/schedules/SchedulePage/SchedulePage';
import { ScheduleDetails } from './views/schedules/SchedulePage/ScheduleDetails';
import { ScheduleRules } from './views/schedules/SchedulePage/ScheduleRules';
import { InventoryPage } from './resources/inventories/InventoryPage/InventoryPage';
import { InventoryDetails } from './resources/inventories/InventoryPage/InventoryDetails';
import { Inventories } from './resources/inventories/Inventories';
import { useMemo } from 'react';
import { PageNavigationItem } from '../../framework';
import { InventorySourcePage } from './resources/inventories/inventorySources/InventorySourcePage';
import { InventorySourceDetails } from './resources/inventories/inventorySources/InventorySourceDetails';
import { Schedules } from './views/schedules/Schedules';

export function useGetAwxInventoryRoutes() {
  const { t } = useTranslation();
  const inventoryRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Inventories,
      label: t('Inventories'),
      path: 'inventories',
      children: [
        {
          id: AwxRoute.InventorySourceSchedulePage,
          path: ':inventory_type/:id/sources/:source_id/schedules/:schedule_id/*',
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
                  page: AwxRoute.InventorySourceScheduleRrules,
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
              id: AwxRoute.InventorySourceScheduleRrules,
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
              element: <Schedules sublistEndpoint="/api/v2/inventory_sources" />,
            },
          ],
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
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventoryHosts,
              path: 'hosts',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventorySources,
              path: 'sources',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventoryJobs,
              path: 'jobs',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InventoryJobTemplates,
              path: 'templates',
              element: <PageNotImplemented />,
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
      ],
    }),
    [t]
  );
  return inventoryRoutes;
}
