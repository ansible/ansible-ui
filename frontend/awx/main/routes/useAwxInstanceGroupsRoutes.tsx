import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { InstanceGroups } from '../../infrastructure/instance-groups/InstanceGroups';
import { AwxRoute } from '../AwxRoutes';

export function useAwxInstanceGroupsRoutes() {
  const { t } = useTranslation();
  const instanceGroupsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.InstanceGroups,
      label: t('Instance Groups'),
      path: 'instance-groups',
      children: [
        {
          id: AwxRoute.CreateInstanceGroup,
          path: 'create',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.EditInstanceGroup,
          path: ':id/edit',
          element: <PageNotImplemented />,
        },
        {
          id: AwxRoute.InstanceGroupPage,
          path: ':id/',
          children: [
            {
              id: AwxRoute.InstanceGroupDetails,
              path: 'details',
              element: <PageNotImplemented />,
            },
          ],
        },
        {
          path: '',
          element: <InstanceGroups />,
        },
      ],
    }),
    [t]
  );
  return instanceGroupsRoutes;
}
