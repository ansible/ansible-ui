import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { PlatformOrganizationDetails } from '../access/organizations/components/PlatformOrganizationDetails';
import { PlatformOrganizationList } from '../access/organizations/components/PlatformOrganizationList';
import { PlatformOrganizationPage } from '../access/organizations/components/PlatformOrganizationPage';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformOrganizationAdmins } from '../access/organizations/components/PlatformOrganizationAdmins';
import { PlatformOrganizationUsers } from '../access/organizations/components/PlatformOrganizationUsers';
import { PlatformOrganizationTeams } from '../access/organizations/components/PlatformOrganizationTeams';
import { PlatformAwxOrganizationIdLookup } from '../access/organizations/components/PlatformAwxOrganizationIdLookup';
import { PlatformOrganizationAddUsers } from '../access/organizations/components/PlatformOrganizationAddUsers';
import { PlatformOrganizationManageUserRoles } from '../access/organizations/components/PlatformOrganizationManageUserRoles';
import { CreatePlatformOrganization } from '../access/organizations/components/CreatePlatformOrganization';
import { EditPlatformOrganization } from '../access/organizations/components/EditPlatformOrganization';
import { PlatformOrganizationTeamsAddRoles } from '../access/organizations/components/PlatformOrganizationTeamsAddRoles';
import { PlatformOrganizationManageTeamRoles } from '../access/organizations/components/PlatformOrganizationManageTeamRoles';
import { ResourceNotifications } from '../../frontend/awx/resources/notifications/ResourceNotifications';
import { PlatformAwxOrganizationExecutionEnvironments } from '../access/organizations/components/PlatformAwxOrganizationExecutionEnvironments';

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
