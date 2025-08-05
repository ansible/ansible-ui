import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { UserRoles } from '@ansible/awx-ui/access/users/UserPage/UserRoles';
import { AddRolesToUser } from '@ansible/awx-ui/access/users/components/AddRolesToUser';
import { EdaAddUserRoles } from '@ansible/eda-ui/access/users/EdaAddUserRoles';
import { EdaUserRoles } from '@ansible/eda-ui/access/users/UserPage/EdaUserRoles';
import { HubUserRoles } from '@ansible/hub-ui/access/users/UserPage/HubUserRoles';
import { HubAddUserRoles } from '@ansible/hub-ui/access/users/components/HubAddUserRoles';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { ApiTokenForm } from '../access/api-tokens/ApiTokenForm';
import { ApiTokenPage } from '../access/api-tokens/ApiTokenPage';
import { ApiTokensTable } from '../access/api-tokens/ApiTokensTable';
import { LegacyTokenForm } from '../access/legacy/legacy-tokens/LegacyTokenForm';
import { LegacyTokenPage } from '../access/legacy/legacy-tokens/LegacyTokenPage';
import { LegacyTokensTable } from '../access/legacy/legacy-tokens/LegacyTokensTable';
import { PlatformAwxUserIdLookup } from '../access/users/components/PlatformAwxUserIdLookup';
import { PlatformEdaUserIdLookup } from '../access/users/components/PlatformEdaUserIdLookup';
import { PlatformHubUserIdLookup } from '../access/users/components/PlatformHubUserIdLookup';
import { PlatformUserDetails } from '../access/users/components/PlatformUserDetails';
import { CreatePlatformUser, EditPlatformUser } from '../access/users/components/PlatformUserForm';
import { PlatformUserPage } from '../access/users/components/PlatformUserPage';
import { PlatformUserRoles } from '../access/users/components/PlatformUserRoles';
import { PlatformUserTeams } from '../access/users/components/PlatformUserTeams';
import { PlatformUsersList } from '../access/users/components/PlatformUsersList';
import { PlatformRoute } from '../main/PlatformRoutes';

export function useGetPlatformUsersRoutes() {
  const { t } = useTranslation();
  const usersRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Users,
      label: t('Users'),
      path: 'users',
      children: [
        {
          id: PlatformRoute.CreateUser,
          path: 'create',
          element: <CreatePlatformUser />,
        },
        {
          id: PlatformRoute.EditUser,
          path: ':id/edit',
          element: <EditPlatformUser />,
        },
        {
          id: PlatformRoute.CreateUserApiToken,
          path: ':id/api-tokens/create',
          element: <ApiTokenForm />,
        },
        {
          id: PlatformRoute.EditUserApiToken,
          path: ':id/api-tokens/:tokenid/edit',
          element: <ApiTokenForm />,
        },
        {
          id: PlatformRoute.UserApiTokenPage,
          path: ':id/api-tokens/:tokenid',
          element: <ApiTokenPage />,
        },
        {
          id: PlatformRoute.CreateUserLegacyToken,
          path: ':id/legacy-tokens/create',
          element: <LegacyTokenForm />,
        },
        {
          id: PlatformRoute.EditUserLegacyToken,
          path: ':id/legacy-tokens/:tokenid/edit',
          element: <LegacyTokenForm />,
        },
        {
          id: PlatformRoute.UserLegacyTokenPage,
          path: ':id/legacy-tokens/:tokenid',
          element: <LegacyTokenPage />,
        },
        {
          id: PlatformRoute.UserPage,
          path: ':id',
          element: <PlatformUserPage />,
          children: [
            {
              id: PlatformRoute.UserDetails,
              path: 'details',
              element: <PlatformUserDetails />,
            },
            {
              id: PlatformRoute.UserTeams,
              path: 'teams',
              element: <PlatformUserTeams />,
            },
            {
              id: PlatformRoute.UserRoles,
              path: 'roles',
              element: <PlatformUserRoles />,
              children: [
                {
                  id: PlatformRoute.AwxUserRoles,
                  path: 'controller',
                  element: (
                    <PlatformAwxUserIdLookup>
                      <UserRoles addRolesRoute={PlatformRoute.AwxUserAddRoles} />
                    </PlatformAwxUserIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.EdaUserRoles,
                  path: 'eda',
                  element: (
                    <PlatformEdaUserIdLookup>
                      <EdaUserRoles addRolesRoute={PlatformRoute.EdaUserAddRoles} />
                    </PlatformEdaUserIdLookup>
                  ),
                },
                {
                  id: PlatformRoute.HubUserRoles,
                  path: 'hub',
                  element: (
                    <PlatformHubUserIdLookup>
                      <HubUserRoles addRolesRoute={PlatformRoute.HubUserAddRoles} />
                    </PlatformHubUserIdLookup>
                  ),
                },
                {
                  path: '',
                  element: <Navigate to="controller" />,
                },
              ],
            },
            {
              id: PlatformRoute.UserApiTokens,
              path: 'api-tokens',
              element: <ApiTokensTable />,
            },
            {
              id: PlatformRoute.UserLegacyTokens,
              path: 'legacy-tokens',
              element: <LegacyTokensTable />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: PlatformRoute.AwxUserAddRoles,
          path: ':id/roles/controller/add-roles',
          element: (
            <PlatformAwxUserIdLookup>
              <AddRolesToUser userRolesRoute={PlatformRoute.AwxUserRoles} />
            </PlatformAwxUserIdLookup>
          ),
        },
        {
          id: PlatformRoute.EdaUserAddRoles,
          path: ':id/roles/eda/add-roles',
          element: (
            <PlatformEdaUserIdLookup>
              <EdaAddUserRoles userRolesRoute={PlatformRoute.EdaUserRoles} />
            </PlatformEdaUserIdLookup>
          ),
        },
        {
          id: PlatformRoute.HubUserAddRoles,
          path: ':id/roles/hub/add-roles',
          element: (
            <PlatformHubUserIdLookup>
              <HubAddUserRoles userRolesRoute={PlatformRoute.HubUserRoles} />
            </PlatformHubUserIdLookup>
          ),
        },
        {
          path: '',
          element: <PlatformUsersList />,
        },
      ],
    }),
    [t]
  );
  return usersRoutes;
}
