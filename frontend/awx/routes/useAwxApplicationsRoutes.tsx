import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { ApplicationPage } from '../administration/applications/ApplicationPage/ApplicationPage';
import { ApplicationPageDetails } from '../administration/applications/ApplicationPage/ApplicationPageDetails';
import { Applications } from '../administration/applications/Applications';
import { ApplicationTokens } from '../administration/applications/ApplicationPage/ApplicationPageTokens';
import { CreateApplication, EditApplication } from '../administration/applications/ApplicationForm';
import { Application } from '../interfaces/Application';
import { ApplicationClientSecretModal } from '../administration/applications/ApplicationPage/ApplicationClientSecretModal';

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
