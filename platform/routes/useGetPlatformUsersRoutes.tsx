import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { PlatformUserDetails } from '../access/users/components/PlatformUserDetails';
import { CreatePlatformUser, EditPlatformUser } from '../access/users/components/PlatformUserForm';
import { PlatformUserPage } from '../access/users/components/PlatformUserPage';
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
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
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
