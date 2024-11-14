import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InstanceDetails } from '../../administration/instances/InstanceDetails';
import { AddInstance, EditInstance } from '../../administration/instances/InstanceForm';
import { InstanceListenerAddresses } from '../../administration/instances/InstanceListenerAddresses';
import { InstancePeers } from '../../administration/instances/InstancePeers';
import { Instances } from '../../administration/instances/Instances';
import { InstancePage } from '../../administration/instances/InstancesPage';
import { AwxRoute } from '../AwxRoutes';

export function useAwxInstancesRoutes() {
  const { t } = useTranslation();

  const instancesRoutes = useMemo<PageNavigationItem>(() => {
    return {
      id: AwxRoute.Instances,
      label: t('Instances'),
      path: 'instances',
      children: [
        {
          id: AwxRoute.AddInstance,
          path: 'add',
          element: <AddInstance />,
        },
        {
          id: AwxRoute.EditInstance,
          path: ':id/edit',
          element: <EditInstance />,
        },
        {
          id: AwxRoute.InstancePage,
          path: ':id',
          element: <InstancePage />,
          children: [
            {
              id: AwxRoute.InstanceDetails,
              path: 'details',
              element: <InstanceDetails />,
            },
            {
              id: AwxRoute.InstanceListenerAddresses,
              path: 'listener-addresses',
              element: <InstanceListenerAddresses />,
            },
            {
              id: AwxRoute.InstancePeers,
              path: 'peers',
              element: <InstancePeers />,
            },
          ],
        },
        {
          path: '',
          element: <Instances />,
        },
      ],
    };
  }, [t]);
  return instancesRoutes;
}
