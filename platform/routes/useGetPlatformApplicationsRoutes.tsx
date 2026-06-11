import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { ApiTokensTable } from '../access/api-tokens/ApiTokensTable';
import { OAuthApplication } from '../access/oauth-applications/OAuthApplication';
import { OAuthApplicationDetails } from '../access/oauth-applications/OAuthApplicationDetails';
import {
  CreateOAuthApplication,
  EditOAuthApplication,
} from '../access/oauth-applications/OAuthApplicationForm';
import { OAuthGatewayApplications } from '../access/oauth-applications/OAuthGatewayApplications';
import { PlatformRoute } from '../main/PlatformRoutes';

export function useGetPlatformApplicationsRoutes() {
  const { t } = useTranslation();

  const applicationsRoutes = useMemo<PageNavigationItem[]>(
    () => [
      {
        id: PlatformRoute.Applications,
        label: t('OAuth Applications'),
        path: 'applications',
        element: <OAuthGatewayApplications />,
      },
      {
        id: PlatformRoute.ApplicationPage,
        path: 'applications/:applicationId',
        element: <OAuthApplication />,
        children: [
          {
            id: PlatformRoute.ApplicationDetails,
            path: 'details',
            element: <OAuthApplicationDetails />,
          },
          {
            id: PlatformRoute.ApplicationTokens,
            path: 'tokens',
            element: <ApiTokensTable />,
          },
          {
            path: '',
            element: <Navigate to="details" />,
          },
        ],
      },
      {
        id: PlatformRoute.CreateApplication,
        path: 'applications/create',
        element: <CreateOAuthApplication />,
      },
      {
        id: PlatformRoute.EditApplication,
        path: 'applications/:id/edit',
        element: <EditOAuthApplication />,
      },
    ],
    [t]
  );
  return applicationsRoutes;
}
