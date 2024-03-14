import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { HostPage } from '../../resources/hosts/HostPage/HostPage';
import { Hosts } from '../../resources/hosts/Hosts';
import { AwxRoute } from '../AwxRoutes';
import { HostJobs } from '../../resources/hosts/HostPage/HostJobs';
import {
  CreateHost,
  EditHost,
} from '../../resources/inventories/inventoryHostsPage/InventoryHostForm';
import { InventoryHostDetails } from '../../resources/inventories/inventoryHostsPage/InventoryHostDetails';
import { InventoryHostGroups } from '../../resources/inventories/inventoryHostsPage/InventoryHostGroups';
import { InventoryHostFacts } from '../../resources/inventories/inventoryHostsPage/InventoryHostFacts';

export function useAwxHostRoutes() {
  const { t } = useTranslation();
  const hostRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Hosts,
      label: t('Hosts'),
      path: 'hosts',
      children: [
        {
          id: AwxRoute.HostPage,
          path: ':id',
          element: <HostPage />,
          children: [
            {
              id: AwxRoute.HostDetails,
              path: 'details',
              element: <InventoryHostDetails />,
            },
            {
              id: AwxRoute.HostFacts,
              path: 'facts',
              element: <InventoryHostFacts page="host" />,
            },
            {
              id: AwxRoute.HostGroups,
              path: 'groups',
              element: <InventoryHostGroups page="host" />,
            },
            {
              id: AwxRoute.HostJobs,
              path: 'jobs',
              element: <HostJobs />,
            },
          ],
        },
        {
          id: AwxRoute.EditHost,
          path: ':id/edit',
          element: <EditHost />,
        },
        {
          id: AwxRoute.CreateHost,
          path: 'create',
          element: <CreateHost />,
        },
        {
          path: '',
          element: <Hosts />,
        },
      ],
    }),
    [t]
  );
  return hostRoutes;
}
