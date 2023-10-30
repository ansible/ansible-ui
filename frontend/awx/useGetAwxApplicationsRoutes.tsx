import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { PageNotImplemented } from '../../framework/PageEmptyStates/PageNotImplemented';
import { AwxRoute } from './AwxRoutes';
import { ApplicationPage } from './administration/applications/ApplicationPage/ApplicationPage';
import { Applications } from './administration/applications/Applications';

export function useGetAwxApplicationsRoutes() {
  const { t } = useTranslation();
  const applicationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Applications,
      label: t('Applications'),
      path: 'applications',
      children: [
        {
          id: AwxRoute.ApplicationPage,
          path: ':id',
          element: <ApplicationPage />,
          children: [
            {
              id: AwxRoute.ApplicationDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.ApplicationTokens,
              path: 'tokens',
              element: <PageNotImplemented />,
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
