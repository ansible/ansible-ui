import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { PlatformOrganizationDetails } from '../access/organizations/components/PlatformOrganizationDetails';
import {
  CreatePlatformOrganization,
  EditPlatformOrganization,
} from '../access/organizations/components/PlatformOrganizationForm';
import { PlatformOrganizationList } from '../access/organizations/components/PlatformOrganizationList';
import { PlatformOrganizationPage } from '../access/organizations/components/PlatformOrganizationPage';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformOrganizationAdmins } from '../access/organizations/components/PlatformOrganizationAdmins';
import { PlatformOrganizationUsers } from '../access/organizations/components/PlatformOrganizationUsers';
import { PlatformOrganizationManageAccess } from '../access/organizations/components/PlatformOrganizationManageAccess';
import { PlatformOrganizationTeams } from '../access/organizations/components/PlatformOrganizationTeams';

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
          ],
        },
        {
          id: PlatformRoute.OrganizationAddUsers,
          path: ':id/users/add-users',
          element: <PlatformOrganizationManageAccess />,
        },
        {
          id: PlatformRoute.OrganizationAddTeams,
          path: ':id/teams/add-teams',
          element: <PlatformOrganizationManageAccess />,
        },
        {
          id: PlatformRoute.OrganizationManageUserRoles,
          path: ':id/users/:userId/manage-roles',
          element: <PlatformOrganizationManageAccess />,
        },
        {
          id: PlatformRoute.OrganizationManageTeamRoles,
          path: ':id/teams/:teamId/manage-roles',
          element: <PlatformOrganizationManageAccess />,
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
