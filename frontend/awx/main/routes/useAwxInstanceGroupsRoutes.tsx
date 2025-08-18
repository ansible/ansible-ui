import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import {
  CreateContainerGroup,
  EditContainerGroup,
} from '../../administration/instance-groups/ContainerGroupForm';
import { InstanceGroupAddUsers } from '../../administration/instance-groups/InstanceGroupAddUsers';
import { InstanceGroupAssignTeams } from '../../administration/instance-groups/InstanceGroupAssignTeams';
import {
  CreateInstanceGroup,
  EditInstanceGroup,
} from '../../administration/instance-groups/InstanceGroupForm';
import { InstanceGroupDetails } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupDetails';
import { InstanceGroupInstances } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstances';
import { InstanceGroupInstancesPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupInstancesPage/InstanceGroupInstancesPage';
import { InstanceGroupJobs } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupJobs';
import { InstanceGroupPage } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupPage';
import { InstanceGroupTeamAccess } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupTeamAccess';
import { InstanceGroupUserAccess } from '../../administration/instance-groups/InstanceGroupPage/InstanceGroupUserAccess';
import { InstanceGroups } from '../../administration/instance-groups/InstanceGroups';
import { InstanceDetails } from '../../administration/instances/InstanceDetails';
import { AwxRoute } from '../AwxRoutes';
import { InstanceGroupManageUsers } from '../../administration/instance-groups/InstanceGroupManageUsers';

export function useAwxInstanceGroupsRoutes() {
  const { t } = useTranslation();
  const instanceGroupsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.InstanceGroups,
      label: t('Instance Groups'),
      path: 'instance-groups',
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
          path: ':id',
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
              id: AwxRoute.InstanceGroupTeamAccess,
              path: 'team-access',
              element: <InstanceGroupTeamAccess />,
            },
            {
              id: AwxRoute.InstanceGroupUserAccess,
              path: 'user-access',
              element: <InstanceGroupUserAccess />,
            },
            {
              id: AwxRoute.InstanceGroupJobs,
              path: 'jobs',
              element: <InstanceGroupJobs />,
            },
            {
              path: '',
              element: <Navigate to="details" replace />,
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
          id: AwxRoute.InstanceGroupAssignTeams,
          path: ':id/instance-groups/teams/assign-teams',
          element: <InstanceGroupAssignTeams />,
        },
        {
          id: AwxRoute.InstanceGroupAddUsers,
          path: ':id/instance-groups/users/add-users',
          element: <InstanceGroupAddUsers />,
        },
        {
          id: AwxRoute.InstanceGroupManageUsers,
          path: ':resource_id/user-access/:resource_type/:user_id/manage',
          element: <InstanceGroupManageUsers />,
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
