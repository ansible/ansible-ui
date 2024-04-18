import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { InstanceGroups } from '../../administration/instance-groups/InstanceGroups';
import { AwxRoute } from '../AwxRoutes';
import { InstanceGroupPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupPage';
import { InstanceGroupInstances } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstances';
import { InstanceDetails } from '../../administration/instances/InstanceDetails';
import { InstanceGroupInstancesPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstancesPage/InstanceGroupInstancesPage';

export function useAwxInstanceGroupsRoutes() {
  const { t } = useTranslation();
  const instanceGroupsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.InstanceGroups,
      label: t('Instance Groups'),
      path: 'instance-groups',
      children: [
        {
          id: AwxRoute.CreateInstanceGroup,
          path: 'create',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.EditInstanceGroup,
          path: ':id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.InstanceGroupPage,
          path: ':id/',
          element: <InstanceGroupPage />,
          children: [
            {
              id: AwxRoute.InstanceGroupDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.InstanceGroupInstances,
              path: 'instances',
              element: <InstanceGroupInstances />,
            },
          ],
        },
        {
          id: AwxRoute.InstanceGroupInstancesPage,
          path: ':id/instances/:instance_id/',
          element: <InstanceGroupInstancesPage />,
          children: [
            {
              id: AwxRoute.InstanceGroupInstanceDetails,
              path: 'details',
              element: <InstanceDetails />,
            },
          ],
        },
        {
          path: '',
          element: <InstanceGroups />,
        },
      ],
    }),
    [t]
  );
  return instanceGroupsRoutes;
}
