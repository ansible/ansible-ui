import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PlatformRoute } from '../main/PlatformRoutes';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { PlatformApplicationsPage } from '../access/applications/PlatformApplicationsPage';
import { PlatformAwxApplications } from '../access/applications/PlatformAwxApplications';
import { PlatformGatewayApplications } from '../access/applications/PlatformGatewayApplications';
import { ApplicationPage } from '../../frontend/awx/administration/applications/ApplicationPage/ApplicationPage';
import {
  CreateApplication,
  EditApplication,
} from '../../frontend/awx/administration/applications/ApplicationForm';
import { Application } from '../../frontend/awx/interfaces/Application';
import {
  CreatePlatformApplication,
  EditPlatformApplication,
} from '../access/applications/PlatformApplicationForm';
import { ApplicationClientSecretModal } from '../../frontend/awx/administration/applications/ApplicationPage/ApplicationClientSecretModal';
import { ApplicationTokens } from '../../frontend/awx/administration/applications/ApplicationPage/ApplicationPageTokens';
import { PlatformApplicationPageDetails } from '../access/applications/ApplicationPage/PlatformApplicationPageDetails';
import { PlatformApplicationPageTokens } from '../access/applications/ApplicationPage/PlatformApplicationPageTokens';
import { ApplicationPageDetails } from '../../frontend/awx/administration/applications/ApplicationPage/ApplicationPageDetails';
import { PlatformApplicationPage } from '../access/applications/ApplicationPage/PlatformApplicationPage';

export function useGetPlatformApplicationsRoutes() {
  const { t } = useTranslation();
  const [applicationModalSource, setApplicationModalSource] = useState<Application>();
  const [platformAppModalSource, setPlatformAppModalSource] = useState<Application>();

  const applicationsRoutes = useMemo<PageNavigationItem[]>(
    () => [
      {
        id: PlatformRoute.ApplicationsPage,
        label: t('OAuth Applications'),
        path: 'applications',
        element: <PlatformApplicationsPage />,
        children: [
          {
            id: AwxRoute.Applications,
            path: 'controller',
            element: <PlatformAwxApplications />,
          },
          {
            id: PlatformRoute.Applications,
            path: 'platform',
            element: <PlatformGatewayApplications />,
          },
          {
            path: '',
            element: <Navigate to="platform" />,
          },
        ],
      },
      {
        id: AwxRoute.ApplicationPage,
        path: 'applications/controller/:id',
        element: (
          <>
            <ApplicationPage />
            {applicationModalSource && (
              <ApplicationClientSecretModal
                onClose={setApplicationModalSource}
                applicationModalSource={applicationModalSource}
              ></ApplicationClientSecretModal>
            )}
          </>
        ),
        children: [
          {
            id: AwxRoute.ApplicationDetails,
            path: 'details',
            element: <ApplicationPageDetails />,
          },
          {
            path: '',
            element: <Navigate to="details" />,
          },
          {
            id: AwxRoute.ApplicationTokens,
            path: 'tokens',
            element: <ApplicationTokens />,
          },
        ],
      },
      {
        id: AwxRoute.CreateApplication,
        path: 'applications/controller/create',
        element: (
          <CreateApplication
            onSuccessfulCreate={(app: Application) => setApplicationModalSource(app)}
          />
        ),
      },
      {
        id: AwxRoute.EditApplication,
        path: 'applications/controller/:id/edit',
        element: <EditApplication />,
      },
      {
        id: PlatformRoute.ApplicationPage,
        path: 'applications/platform/:id',
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
        path: 'applications/platform/create',
        element: (
          <CreatePlatformApplication
            onSuccessfulCreate={(app: Application) => setPlatformAppModalSource(app)}
          />
        ),
      },
      {
        id: PlatformRoute.EditApplication,
        path: 'applications/platform/:id/edit',
        element: <EditPlatformApplication />,
      },
    ],
    [t, applicationModalSource, platformAppModalSource]
  );
  return applicationsRoutes;
}
