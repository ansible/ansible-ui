import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { ResourceNotifications } from '@ansible/awx-ui/resources/notifications/ResourceNotifications';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { CreatePlatformOrganization } from '../access/organizations/components/CreatePlatformOrganization';
import { EditPlatformOrganization } from '../access/organizations/components/EditPlatformOrganization';
import { PlatformAAPOrganizationUsers } from '../access/organizations/components/PlatformAAPOrganizationUsers';
import { PlatformAwxOrganizationExecutionEnvironments } from '../access/organizations/components/PlatformAwxOrganizationExecutionEnvironments';
import { PlatformAwxOrganizationIdLookup } from '../access/organizations/components/PlatformAwxOrganizationIdLookup';
import { PlatformAwxOrganizationUsers } from '../access/organizations/components/PlatformAwxOrganizationUsers';
import { PlatformOrganizationAddUsers } from '../access/organizations/components/PlatformOrganizationAddUsers';
import { PlatformOrganizationAdmins } from '../access/organizations/components/PlatformOrganizationAdmins';
import { PlatformOrganizationDetails } from '../access/organizations/components/PlatformOrganizationDetails';
import { PlatformOrganizationList } from '../access/organizations/components/PlatformOrganizationList';
import { PlatformOrganizationManageTeamRoles } from '../access/organizations/components/PlatformOrganizationManageTeamRoles';
import { PlatformOrganizationManageUserRoles } from '../access/organizations/components/PlatformOrganizationManageUserRoles';
import { PlatformOrganizationPage } from '../access/organizations/components/PlatformOrganizationPage';
import { PlatformOrganizationTeams } from '../access/organizations/components/PlatformOrganizationTeams';
import { PlatformOrganizationTeamsAddRoles } from '../access/organizations/components/PlatformOrganizationTeamsAddRoles';
import { PlatformOrganizationUsers } from '../access/organizations/components/PlatformOrganizationUsers';
import { PlatformRoute } from '../main/PlatformRoutes';

export function useGetPlatformOrganizationsRoutes() {
  const { t } = useTranslation();
  const organizationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Organizations,
      label: t('Organizations'),
      path: 'organizations',
      children: [
        {
          id: PlatformRoute.CreateOrganization,
          path: 'create',
          element: <CreatePlatformOrganization />,
        },
        {
          id: PlatformRoute.EditOrganization,
          path: ':id/edit',
          element: <EditPlatformOrganization />,
        },
        {
          id: PlatformRoute.OrganizationPage,
          path: ':id',
          element: <PlatformOrganizationPage />,
          children: [
            {
              id: PlatformRoute.OrganizationDetails,
              path: 'details',
              element: <PlatformOrganizationDetails />,
            },
            {
              id: PlatformRoute.OrganizationUsers,
              path: 'users',
              element: <PlatformOrganizationUsers />,
              children: [
                {
                  id: PlatformRoute.AAPOrganizationUsers,
                  path: 'platform',
                  element: <PlatformAAPOrganizationUsers />,
                },
                {
                  id: PlatformRoute.AwxOrganizationUsers,
                  path: 'controller',
                  element: <PlatformAwxOrganizationUsers />,
                },
                {
                  path: '',
                  element: <Navigate to="platform" />,
                },
              ],
            },
            {
              id: PlatformRoute.OrganizationAdmins,
              path: 'admins',
              element: <PlatformOrganizationAdmins />,
            },
            {
              id: PlatformRoute.OrganizationTeams,
              path: 'resource-access',
              element: <PlatformOrganizationTeams />,
            },
            {
              id: PlatformRoute.OrganizationExecutionEnvironments,
              path: 'execution-environments',
              element: (
                <PlatformAwxOrganizationIdLookup>
                  <PlatformAwxOrganizationExecutionEnvironments />
                </PlatformAwxOrganizationIdLookup>
              ),
            },
            {
              id: PlatformRoute.OrganizationNotifications,
              path: 'notifications',
              element: (
                <PlatformAwxOrganizationIdLookup>
                  <ResourceNotifications resourceType="organizations" />
                </PlatformAwxOrganizationIdLookup>
              ),
            },
          ],
        },
        {
          id: PlatformRoute.OrganizationAddUsers,
          path: ':id/users/add-users',
          element: <PlatformOrganizationAddUsers />,
        },
        {
          id: PlatformRoute.OrganizationTeamsAddRoles,
          path: ':id/teams/add-roles',
          element: <PlatformOrganizationTeamsAddRoles />,
        },
        {
          id: PlatformRoute.OrganizationAddTeams,
          path: ':id/teams/add-teams',
          element: <PlatformOrganizationManageUserRoles />,
        },
        {
          id: PlatformRoute.OrganizationManageUserRoles,
          path: ':id/users/:userId/manage-roles',
          element: <PlatformOrganizationManageUserRoles />,
        },
        {
          id: PlatformRoute.OrganizationManageTeamRoles,
          path: ':id/teams/:teamId/manage-roles',
          element: <PlatformOrganizationManageTeamRoles />,
        },
        {
          path: '',
          element: <PlatformOrganizationList />,
        },
      ],
    }),
    [t]
  );
  return organizationsRoutes;
}
