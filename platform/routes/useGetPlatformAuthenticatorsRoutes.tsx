import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem, PageNotImplemented } from '../../framework';
import { AuthenticatorPage } from '../access/authenticators/AuthenticatorPage/AuthenticatorPage';
import { PlatformAuthenticatorDetails } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorDetails';
import { CreateAuthenticator } from '../access/authenticators/components/AuthenticatorForm';
import { AuthenticatorsList } from '../access/authenticators/components/AuthenticatorsList';
import { PlatformRoute } from '../main/PlatformRoutes';

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
          element: <CreateAuthenticator />,
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
