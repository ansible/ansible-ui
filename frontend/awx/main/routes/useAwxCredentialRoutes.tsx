import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CredentialAddUsers } from '../../access/credentials/components/CredentialAddUsers';
import { CredentialAssignTeams } from '../../access/credentials/components/CredentialAssignTeams';
import { CreateCredential, EditCredential } from '../../access/credentials/CredentialForm';
import { CredentialDetails } from '../../access/credentials/CredentialPage/CredentialDetails';
import { CredentialJobTemplates } from '../../access/credentials/CredentialPage/CredentialJobTemplates';
import { CredentialPage } from '../../access/credentials/CredentialPage/CredentialPage';
import { CredentialTeamAccess } from '../../access/credentials/CredentialPage/CredentialTeamAccess';
import { CredentialUserAccess } from '../../access/credentials/CredentialPage/CredentialUserAccess';
import { Credentials } from '../../access/credentials/Credentials';
import { AwxRoute } from '../AwxRoutes';

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
          id: AwxRoute.CredentialAssignTeams,
          path: ':id/team-access/assign',
          element: <CredentialAssignTeams />,
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
