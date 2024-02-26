import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { InstanceDetails } from '../../infrastructure/instances/InstanceDetails';
import { AddInstance, EditInstance } from '../../infrastructure/instances/InstanceForm';
import { Instances } from '../../infrastructure/instances/Instances';
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
          id: AwxRoute.InstanceDetails,
          path: ':id/details',
          element: <InstanceDetails />,
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
