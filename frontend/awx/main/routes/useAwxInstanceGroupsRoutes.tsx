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
import {
  CreateInstanceGroup,
  EditInstanceGroup,
} from '../../administration/instance-groups/InstanceGroupForm';
import { InstanceGroupDetails } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupDetails';

export function useAwxInstanceGroupsRoutes() {
  const { t } = useTranslation();
  const instanceGroupsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.InstanceGroups,
      label: t('Instance Groups'),
      path: 'instance_groups',
      children: [
        {
          id: AwxRoute.CreateInstanceGroup,
          path: 'create',
          element: <CreateInstanceGroup />,
        },
        {
          id: AwxRoute.EditInstanceGroup,
          path: ':id/edit',
          element: <EditInstanceGroup />,
        },
        {
          id: AwxRoute.InstanceGroupPage,
          path: ':id/',
          element: <InstanceGroupPage />,
          children: [
            {
              id: AwxRoute.InstanceGroupDetails,
              path: 'details',
              element: <InstanceGroupDetails />,
            },
            {
              id: AwxRoute.InstanceGroupInstances,
              path: 'instances',
              element: <InstanceGroupInstances />,
            },
            {
              id: AwxRoute.InstanceGroupJobs,
              path: 'jobs',
              element: <PageNotImplemented />,
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
