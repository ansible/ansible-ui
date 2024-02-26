import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import {
  CreateApplication,
  EditApplication,
} from '../../administration/oauth-applications/ApplicationForm';
import { ApplicationClientSecretModal } from '../../administration/oauth-applications/ApplicationPage/ApplicationClientSecretModal';
import { ApplicationPage } from '../../administration/oauth-applications/ApplicationPage/ApplicationPage';
import { ApplicationPageDetails } from '../../administration/oauth-applications/ApplicationPage/ApplicationPageDetails';
import { ApplicationTokens } from '../../administration/oauth-applications/ApplicationPage/ApplicationPageTokens';
import { Applications } from '../../administration/oauth-applications/Applications';
import { Application } from '../../interfaces/Application';
import { AwxRoute } from '../AwxRoutes';

export function useAwxApplicationsRoutes() {
  const { t } = useTranslation();
  const [applicationModalSource, setApplicationModalSource] = useState<Application>();

  const applicationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Applications,
      label: t('OAuth Applications'),
      path: 'applications',
      children: [
        {
          id: AwxRoute.CreateApplication,
          path: 'create',
          element: (
            <CreateApplication
              onSuccessfulCreate={(app: Application) => setApplicationModalSource(app)}
            />
          ),
        },
        {
          id: AwxRoute.EditApplication,
          path: ':id/edit',
          element: <EditApplication />,
        },
        {
          id: AwxRoute.ApplicationPage,
          path: ':id',
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
              id: AwxRoute.ApplicationTokens,
              path: 'tokens',
              element: <ApplicationTokens />,
            },
          ],
        },
        {
          path: '',
          element: <Applications />,
        },
      ],
    }),
    [t, applicationModalSource]
  );
  return applicationsRoutes;
}
