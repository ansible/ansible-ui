import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageNavigationItem } from '../../framework';
import { AwxRoute } from './AwxRoutes';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { InstanceGroups } from './administration/instance-groups/InstanceGroups';

export function useGetAwxInstanceGroupsRoutes() {
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
          path: ':id/*',
          element: <PageNotImplemented />,
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
