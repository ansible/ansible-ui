import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { CreateCredential, EditCredential } from '../../access/credentials/CredentialForm';
import { CredentialDetails } from '../../access/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../../access/credentials/CredentialPage/CredentialPage';
import { Credentials } from '../../access/credentials/Credentials';
import { AwxRoute } from '../AwxRoutes';
import { CredentialJobTemplates } from '../../access/credentials/CredentialPage/CredentialJobTemplates';

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
            {
              id: AwxRoute.CredentialJobTemplates,
              path: 'templates',
              element: <CredentialJobTemplates />,
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
