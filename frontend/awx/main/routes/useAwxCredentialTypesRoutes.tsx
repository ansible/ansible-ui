import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../../framework';
import {
  CreateCredentialType,
  EditCredentialType,
} from '../../access/credential-types/CredentialTypeForm';
import { CredentialTypeCredentials } from '../../access/credential-types/CredentialTypePage/CredentialTypeCredentials';
import { CredentialTypeDetails } from '../../access/credential-types/CredentialTypePage/CredentialTypeDetails';
import { CredentialTypePage } from '../../access/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypes } from '../../access/credential-types/CredentialTypes';
import { AwxRoute } from '../AwxRoutes';

export function useAwxCredentialTypesRoutes() {
  const { t } = useTranslation();
  const workflowApprovalRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.CredentialTypes,
      label: t('Credential Types'),
      path: 'credential-types',
      children: [
        {
          id: AwxRoute.CreateCredentialType,
          path: 'create',
          element: <CreateCredentialType />,
        },
        {
          id: AwxRoute.EditCredentialType,
          path: ':id/edit',
          element: <EditCredentialType />,
        },
        {
          id: AwxRoute.CredentialTypePage,
          path: ':id/',
          element: <CredentialTypePage />,
          children: [
            {
              id: AwxRoute.CredentialTypeDetails,
              path: 'details',
              element: <CredentialTypeDetails />,
            },
            {
              id: AwxRoute.CredentialTypeCredentials,
              path: 'credentials',
              element: <CredentialTypeCredentials />,
            },
            {
              path: '',
              element: <Navigate to="details" />,
            },
          ],
        },
        {
          path: '',
          element: <CredentialTypes />,
        },
      ],
    }),
    [t]
  );
  return workflowApprovalRoutes;
}
