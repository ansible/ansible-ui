import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import { CreateUser, EditUser } from '../../access/users/UserForm';
import { AwxUserDetails } from '../../access/users/UserPage/AwxUserDetails';
import { UserOrganizations } from '../../access/users/UserPage/UserOrganizations';
import { UserPage } from '../../access/users/UserPage/UserPage';
import { UserRoles } from '../../access/users/UserPage/UserRoles';
import { UserTeams } from '../../access/users/UserPage/UserTeams';
import { UserTokens } from '../../access/users/UserPage/UserTokens';
import { Users } from '../../access/users/Users';
import { AddRolesToUser } from '../../access/users/components/AddRolesToUser';
import { AwxRoute } from '../AwxRoutes';

export function useAwxUsersRoutes() {
  const { t } = useTranslation();
  const usersRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Users,
      label: t('Users'),
      path: 'users',
      children: [
        {
          id: AwxRoute.CreateUser,
          path: 'create',
          element: <CreateUser />,
        },
        {
          id: AwxRoute.EditUser,
          path: ':id/edit',
          element: <EditUser />,
        },
        {
          id: AwxRoute.UserPage,
          path: ':id',
          element: <UserPage />,
          children: [
            {
              id: AwxRoute.UserDetails,
              path: 'details',
              element: <AwxUserDetails />,
            },
            {
              id: AwxRoute.UserOrganizations,
              path: 'organizations',
              element: <UserOrganizations />,
            },
            {
              id: AwxRoute.UserTeams,
              path: 'teams',
              element: <UserTeams />,
            },
            {
              id: AwxRoute.UserRoles,
              path: 'roles',
              element: <UserRoles />,
            },
            {
              id: AwxRoute.UserTokens,
              path: 'tokens',
              element: <UserTokens />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          id: AwxRoute.AddRolesToUser,
          path: ':id/roles/add-roles',
          element: <AddRolesToUser />,
        },
        {
          path: '',
          element: <Users />,
        },
      ],
    }),
    [t]
  );
  return usersRoutes;
}
