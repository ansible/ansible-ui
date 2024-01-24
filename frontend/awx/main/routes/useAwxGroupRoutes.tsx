import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem, PageNotImplemented } from '../../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { GroupPage } from '../../resources/groups/GroupPage/GroupPage';

export function useAwxGroupRoutes() {
  const { t } = useTranslation();
  const groupRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Groups,
      label: t('Groups'),
      path: 'groups',
      children: [
        {
          id: AwxRoute.GroupPage,
          path: ':id',
          element: <GroupPage />,
          children: [
            {
              id: AwxRoute.GroupDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.GroupRelatedGroups,
              path: 'related_groups',
              element: <PageNotImplemented />,
            },
            {
              id: AwxRoute.GroupHosts,
              path: 'hosts',
              element: <PageNotImplemented />,
            },
          ],
        },
      ],
    }),
    [t]
  );
  return groupRoutes;
}
