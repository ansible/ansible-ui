import { useMemo } from 'react';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { PlatformRoute } from '../PlatformRoutes';
import { AuthenticatorPage } from '../access/authenticators/AuthenticatorPage/AuthenticatorPage';
import { PlatformAuthenticatorDetails } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorDetails';
import { AuthenticatorsList } from '../access/authenticators/components/AuthenticatorsList';
import { useTranslation } from 'react-i18next';

export function useGetPlatformAuthenticatorsRoutes() {
  const { t } = useTranslation();
  const authenticatorsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Authenticators,
      label: t('Authentication'),
      path: 'authenticators',
      children: [
        {
          id: PlatformRoute.CreateAuthenticator,
          path: 'create',
          element: <PageNotImplemented />,
        },
        {
          id: PlatformRoute.EditAuthenticator,
          path: ':id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: PlatformRoute.AuthenticatorPage,
          path: ':id',
          element: <AuthenticatorPage />,
          children: [
            {
              id: PlatformRoute.AuthenticatorDetails,
              path: 'details',
              element: <PlatformAuthenticatorDetails />,
            },
          ],
        },
        {
          path: '',
          element: <AuthenticatorsList />,
        },
      ],
    }),
    [t]
  );
  return authenticatorsRoutes;
}
