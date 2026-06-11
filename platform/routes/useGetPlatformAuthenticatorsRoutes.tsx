import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticatorPage } from '../access/authenticators/AuthenticatorPage/AuthenticatorPage';
import { PlatformAuthenticatorDetails } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorDetails';
import { PlatformAuthenticatorMappings } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorMappings';
import { CreateAuthenticator } from '../access/authenticators/CreateAuthenticator';
import { EditAuthenticator } from '../access/authenticators/EditAuthenticator';
import { AuthenticatorsList } from '../access/authenticators/components/AuthenticatorsList';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformAuthenticatorMappingDetails } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorMappingDetails';
import { PlatformAuthenticatorMappingPage } from '../access/authenticators/AuthenticatorPage/PlatformAuthenticatorMappingPage';
import {
  CreateAuthenticatorMapping,
  EditAuthenticatorMapping,
} from '../access/authenticators/components/AuthenticatorMappingForm';

export function useGetPlatformAuthenticatorsRoutes() {
  const { t } = useTranslation();
  const authenticatorsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: PlatformRoute.Authenticators,
      label: t('Authentication Methods'),
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
          element: <EditAuthenticator />,
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
            {
              id: PlatformRoute.AuthenticatorMappings,
              path: 'mappings',
              element: <PlatformAuthenticatorMappings />,
            },
          ],
        },
        {
          id: PlatformRoute.AuthenticatorMappingPage,
          path: ':id/mappings/:map_id',
          element: <PlatformAuthenticatorMappingPage />,
          children: [
            {
              id: PlatformRoute.AuthenticatorMappingDetails,
              path: 'details',
              element: <PlatformAuthenticatorMappingDetails />,
            },
          ],
        },
        {
          path: '',
          element: <AuthenticatorsList />,
        },
        {
          id: PlatformRoute.CreateAuthenticatorMapping,
          path: ':id/mappings/create',
          element: <CreateAuthenticatorMapping />,
        },
        {
          id: PlatformRoute.EditAuthenticatorMapping,
          path: ':id/mappings/:map_id/edit',
          element: <EditAuthenticatorMapping />,
        },
      ],
    }),
    [t]
  );
  return authenticatorsRoutes;
}
