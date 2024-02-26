import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { HostPage } from '../../infrastructure/hosts/HostPage/HostPage';
import { Hosts } from '../../infrastructure/hosts/Hosts';
import { AwxRoute } from '../AwxRoutes';

export function useAwxHostRoutes() {
  const { t } = useTranslation();
  const hostRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Hosts,
      label: t('Hosts'),
      path: 'hosts',
      children: [
        {
          id: AwxRoute.HostPage,
          path: ':id',
          element: <HostPage />,
          children: [
            {
              id: AwxRoute.HostDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.HostFacts,
              path: 'facts',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.HostGroups,
              path: 'groups',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.HostJobs,
              path: 'jobs',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <Hosts />,
        },
      ],
    }),
    [t]
  );
  return hostRoutes;
}
