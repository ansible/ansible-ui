import { useMemo } from 'react';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { PlatformRoute } from '../PlatformRoutes';
import { CreateUser, EditUser } from '../access/users/components/UserForm';
import { UserPage } from '../access/users/components/UserPage';
import { PlatformUserDetails } from '../access/users/components/PlatformUserDetails';
import { UsersList } from '../access/users/components/UsersList';
import { useTranslation } from 'react-i18next';

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
          element: <CreateUser />,
        },
        {
          id: PlatformRoute.EditUser,
          path: ':id/edit',
          element: <EditUser />,
        },
        {
          id: PlatformRoute.UserPage,
          path: ':id',
          element: <UserPage />,
          children: [
            {
              id: PlatformRoute.UserDetails,
              path: 'details',
              element: <PlatformUserDetails />,
            },
            {
              id: PlatformRoute.UserTeams,
              path: 'teams',
              element: <PageNotImplemented />,
            },
            {
              id: PlatformRoute.UserRoles,
              path: 'roles',
              element: <PageNotImplemented />,
            },
            {
              id: PlatformRoute.UserResourceAccess,
              path: 'resource-access',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <UsersList />,
        },
      ],
    }),
    [t]
  );
  return usersRoutes;
}
