import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../framework';
import { PageNotImplemented } from '../../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from '../AwxRoutes';
import { ApplicationPage } from '../administration/applications/ApplicationPage/ApplicationPage';
import { ApplicationPageDetails } from '../administration/applications/ApplicationPage/ApplicationPageDetails';
import { Applications } from '../administration/applications/Applications';
import { ApplicationTokens } from '../administration/applications/ApplicationPage/ApplicationPageTokens';
import { CreateApplication } from '../administration/applications/ApplicationForm';

export function useAwxApplicationsRoutes() {
  const { t } = useTranslation();
  const applicationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Applications,
      label: t('OAuth Applications'),
      path: 'applications',
      children: [
        {
          id: AwxRoute.CreateApplication,
          path: 'create',
          element: <CreateApplication />,
        },
        {
          id: AwxRoute.EditApplication,
          path: ':id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.ApplicationPage,
          path: ':id',
          element: <ApplicationPage />,
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
    [t]
  );
  return applicationsRoutes;
}
