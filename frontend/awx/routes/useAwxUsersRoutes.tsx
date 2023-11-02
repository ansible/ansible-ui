import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { CreateUser, EditUser } from '../access/users/UserForm';
import { AddRolesToUser } from '../access/users/components/AddRolesToUser';
import { UserPage } from '../access/users/UserPage/UserPage';
import { UserDetails } from '../access/users/UserPage/UserDetails';
import { UserOrganizations } from '../access/users/UserPage/UserOrganizations';
import { UserTeams } from '../access/users/UserPage/UserTeams';
import { UserRoles } from '../access/users/UserPage/UserRoles';
import { Navigate } from 'react-router-dom';
import { Users } from '../access/users/Users';

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
          id: AwxRoute.AddRolesToUser,
          path: ':id/roles/add',
          element: <AddRolesToUser />,
        },
        {
          id: AwxRoute.UserPage,
          path: ':id',
          element: <UserPage />,
          children: [
            {
              id: AwxRoute.UserDetails,
              path: 'details',
              element: <UserDetails />,
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
              path: '',
              element: <Navigate to="details" />,
            },
          ],
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
