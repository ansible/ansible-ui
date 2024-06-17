import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { CreateCredential, EditCredential } from '../../access/credentials/CredentialForm';
import { CredentialDetails } from '../../access/credentials/CredentialPage/CredentialDetails';
import { CredentialPage } from '../../access/credentials/CredentialPage/CredentialPage';
import { Credentials } from '../../access/credentials/Credentials';
import { AwxRoute } from '../AwxRoutes';
import { CredentialJobTemplates } from '../../access/credentials/CredentialPage/CredentialJobTemplates';
import { CredentialAddUsers } from '../../access/credentials/components/CredentialAddUsers';
import { CredentialAddTeams } from '../../access/credentials/components/CredentialAddTeams';
import { CredentialTeamAccess } from '../../access/credentials/CredentialPage/CredentialTeamAccess';
import { CredentialUserAccess } from '../../access/credentials/CredentialPage/CredentialUserAccess';

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
              id: AwxRoute.CredentialJobTemplates,
              path: 'templates',
              element: <CredentialJobTemplates />,
            },
            {
              id: AwxRoute.CredentialTeamAccess,
              path: 'team-access',
              element: <CredentialTeamAccess />,
            },
            {
              id: AwxRoute.CredentialUserAccess,
              path: 'user-access',
              element: <CredentialUserAccess />,
            },
          ],
        },
        {
          id: AwxRoute.CredentialAddUsers,
          path: ':id/user-access/add',
          element: <CredentialAddUsers />,
        },
        {
          id: AwxRoute.CredentialAddTeams,
          path: ':id/team-access/add',
          element: <CredentialAddTeams />,
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
