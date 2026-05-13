import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deprecations } from '../../administration/deprecations/Deprecations';
import { DeprecationAffectedJobs } from '../../administration/deprecations/DeprecationAffectedJobs';
import { DeprecationDetails } from '../../administration/deprecations/DeprecationDetails';
import { DeprecationDetailPage } from '../../administration/deprecations/DeprecationDetailPage';
import { AwxRoute } from '../AwxRoutes';

export function useAwxDeprecationsRoutes() {
  const { t } = useTranslation();
  const deprecationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Deprecations,
      label: t('Deprecations'),
      path: 'deprecations',
      children: [
        {
          path: '',
          element: <Deprecations />,
        },
        {
          id: AwxRoute.DeprecationPage,
          path: ':deprecationType',
          element: <DeprecationDetailPage />,
          children: [
            {
              id: AwxRoute.DeprecationDetails,
              path: 'details',
              element: <DeprecationDetails />,
            },
            {
              id: AwxRoute.DeprecationAffectedJobs,
              path: 'affected-jobs',
              element: <DeprecationAffectedJobs />,
            },
          ],
        },
      ],
    }),
    [t]
  );
  return deprecationsRoutes;
}
