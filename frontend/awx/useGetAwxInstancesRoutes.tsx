import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { EditInstance } from './administration/instances/EditInstance';
import { InstanceDetails } from './administration/instances/InstanceDetails';
import { Instances } from './administration/instances/Instances';

export function useGetAwxInstancesRoutes() {
  const { t } = useTranslation();
  const instancesRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Instances,
      label: t('Instances'),
      path: 'instances',
      children: [
        {
          id: AwxRoute.EditInstance,
          path: ':id/edit',
          element: <EditInstance />,
        },
        {
          id: AwxRoute.InstancePage,
          path: ':id/*',
          element: <InstanceDetails />,
        },
        {
          path: '',
          element: <Instances />,
        },
      ],
    }),
    [t]
  );
  return instancesRoutes;
}
