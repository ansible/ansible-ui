import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { AwxRoute } from '../AwxRoutes';
import {
  CreateCredentialType,
  EditCredentialType,
} from '../administration/credential-types/CredentialTypeForm';
import { CredentialTypePage } from '../administration/credential-types/CredentialTypePage/CredentialTypePage';
import { CredentialTypeDetails } from '../administration/credential-types/CredentialTypePage/CredentialTypeDetails';
import { CredentialTypeCredentials } from '../administration/credential-types/CredentialTypePage/CredentialTypeCredentials';
import { Navigate } from 'react-router-dom';
import { CredentialTypes } from '../administration/credential-types/CredentialTypes';

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
