import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { InstanceGroups } from '../../administration/instance-groups/InstanceGroups';
import { AwxRoute } from '../AwxRoutes';
import { InstanceGroupInstances } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstances';
import { InstanceDetails } from '../../administration/instances/InstanceDetails';
import { InstanceGroupInstancesPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstancesPage/InstanceGroupInstancesPage';
import {
  CreateInstanceGroup,
  EditInstanceGroup,
} from '../../administration/instance-groups/InstanceGroupForm';
import { InstanceGroupDetails } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupDetails';
import { InstanceGroupJobs } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupJobs';
import {
  CreateContainerGroup,
  EditContainerGroup,
} from '../../administration/instance-groups/ContainerGroupForm';
import { InstanceGroupPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupPage';

export function useAwxInstanceGroupsRoutes() {
  const { t } = useTranslation();
  const instanceGroupsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.InstanceGroups,
      label: t('Instance Groups'),
      path: 'instance_groups',
      children: [
        {
          id: AwxRoute.CreateContainerGroup,
          path: 'container-group/create',
          element: <CreateContainerGroup />,
        },
        {
          id: AwxRoute.EditContainerGroup,
          path: 'container-group/:id/edit',
          element: <EditContainerGroup />,
        },
        {
          id: AwxRoute.CreateInstanceGroup,
          path: 'instance-group/create',
          element: <CreateInstanceGroup />,
        },
        {
          id: AwxRoute.EditInstanceGroup,
          path: 'instance-group/:id/edit',
          element: <EditInstanceGroup />,
        },
        {
          id: AwxRoute.InstanceGroupPage,
          path: ':instanceType/:id/',
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
              element: <InstanceGroupJobs />,
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
