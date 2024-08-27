import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformGatewayApplications } from '../access/applications/PlatformGatewayApplications';
import { Application } from '../../frontend/awx/interfaces/Application';
import {
  CreatePlatformApplication,
  EditPlatformApplication,
} from '../access/applications/PlatformApplicationForm';
import { ApplicationClientSecretModal } from '../access/applications/ApplicationPage/ApplicationClientSecretModal';
import { PlatformApplicationPageDetails } from '../access/applications/ApplicationPage/PlatformApplicationPageDetails';
import { PlatformApplicationPageTokens } from '../access/applications/ApplicationPage/PlatformApplicationPageTokens';
import { PlatformApplicationPage } from '../access/applications/ApplicationPage/PlatformApplicationPage';

export function useGetPlatformApplicationsRoutes() {
  const { t } = useTranslation();
  const [platformAppModalSource, setPlatformAppModalSource] = useState<Application>();

  const applicationsRoutes = useMemo<PageNavigationItem[]>(
    () => [
      {
        id: PlatformRoute.Applications,
        label: t('OAuth Applications'),
        path: 'applications',
        element: <PlatformGatewayApplications />,
      },
      {
        id: PlatformRoute.ApplicationPage,
        path: 'applications/:id',
        element: (
          <>
            <PlatformApplicationPage />
            {platformAppModalSource && (
              <ApplicationClientSecretModal
                onClose={setPlatformAppModalSource}
                applicationModalSource={platformAppModalSource}
              ></ApplicationClientSecretModal>
            )}
          </>
        ),
        children: [
          {
            id: PlatformRoute.ApplicationDetails,
            path: 'details',
            element: <PlatformApplicationPageDetails />,
          },
          {
            path: '',
            element: <Navigate to="details" />,
          },
          {
            id: PlatformRoute.ApplicationTokens,
            path: 'tokens',
            element: <PlatformApplicationPageTokens />,
          },
        ],
      },
      {
        id: PlatformRoute.CreateApplication,
        path: 'applications/create',
        element: (
          <CreatePlatformApplication
            onSuccessfulCreate={(app: Application) => setPlatformAppModalSource(app)}
          />
        ),
      },
      {
        id: PlatformRoute.EditApplication,
        path: 'applications/:id/edit',
        element: <EditPlatformApplication />,
      },
    ],
    [t, platformAppModalSource]
  );
  return applicationsRoutes;
}
