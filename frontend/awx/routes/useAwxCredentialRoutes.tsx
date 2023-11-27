import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { PageNotImplemented } from '../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';
import { CreateCredential, EditCredential } from '../resources/credentials/CredentialForm';
import { CredentialDetails } from '../resources/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../resources/credentials/CredentialPage/CredentialPage';
import { Credentials } from '../resources/credentials/Credentials';

export function useAwxCredentialRoutes() {
  const { t } = useTranslation();
  const credentialRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Credentials,
      label: t('Credentials'),
      path: 'credentials',
      children: [
        {
          id: AwxRoute.CreateCredential,
          path: 'create',
          element: <CreateCredential />,
        },
        {
          id: AwxRoute.EditCredential,
          path: ':id/edit',
          element: <EditCredential />,
        },
        {
          id: AwxRoute.CredentialPage,
          path: ':id',
          element: <CredentialPage />,
          children: [
            {
              id: AwxRoute.CredentialDetails,
              path: 'details',
              element: <CredentialDetails />,
            },
            {
              id: AwxRoute.CredentialAccess,
              path: 'access',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <Credentials />,
        },
      ],
    }),
    [t]
  );
  return credentialRoutes;
}
