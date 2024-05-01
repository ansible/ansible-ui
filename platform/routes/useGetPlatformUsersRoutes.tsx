import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { PlatformUserDetails } from '../access/users/components/PlatformUserDetails';
import { CreatePlatformUser, EditPlatformUser } from '../access/users/components/PlatformUserForm';
import { PlatformUsersList } from '../access/users/components/PlatformUsersList';
import { PlatformUserPage } from '../access/users/components/PlatformUserPage';
import { PlatformUserTeams } from '../access/users/components/PlatformUserTeams';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformUserRoles } from '../access/users/components/PlatformUserRoles';
import { UserRoles } from '../../frontend/awx/access/users/UserPage/UserRoles';
import { PlatformAwxUserIdLookup } from '../access/users/components/PlatformAwxUserIdLookup';
import { EdaUserRoles } from '../../frontend/eda/access/users/UserPage/EdaUserRoles';
import { PlatformEdaUserIdLookup } from '../access/users/components/PlatformEdaUserIdLookup';
import { AddRolesToUser } from '../../frontend/awx/access/users/components/AddRolesToUser';
import { EdaAddUserRoles } from '../../frontend/eda/access/users/EdaAddUserRoles';

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
                  path: '',
                  element: <Navigate to="controller" />,
                },
              ],
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
            <PlatformEdaUserIdLookup>
              <AddRolesToUser userRolesRoute={PlatformRoute.AwxUserRoles} />
            </PlatformEdaUserIdLookup>
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
          path: '',
          element: <PlatformUsersList />,
        },
      ],
    }),
    [t]
  );
  return usersRoutes;
}
