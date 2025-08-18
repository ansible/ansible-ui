import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlatformRoleDetails } from '../access/roles/PlatformRoleDetails';
import { PlatformRoles } from '../access/roles/PlatformRoles';
import { PlatformRoute } from '../main/PlatformRoutes';
import { CreatePlatformRole, EditPlatformRole } from '../access/roles/PlatformRoleForm';

export function useGetPlatformRolesRoutes() {
  const { t } = useTranslation();

  const rolesRoutes = useMemo<PageNavigationItem[]>(() => {
    const navItem: PageNavigationItem[] = [
      {
        id: PlatformRoute.Roles,
        label: t('Roles'),
        path: 'roles',
        children: [
          {
            id: PlatformRoute.CreateRole,
            path: 'create',
            element: <CreatePlatformRole />,
          },
          {
            id: PlatformRoute.EditRole,
            path: ':id/edit',
            element: <EditPlatformRole />,
          },
          {
            id: PlatformRoute.RoleDetails as string,
            path: ':id',
            element: <PlatformRoleDetails />,
          },
          {
            path: '',
            element: <PlatformRoles />,
          },
        ],
      },
    ];
    return navItem;
  }, [t]);
  return rolesRoutes;
}
