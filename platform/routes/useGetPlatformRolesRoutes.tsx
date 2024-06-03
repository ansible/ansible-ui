import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { AwxRoleDetails } from '../../frontend/awx/access/roles/AwxRoleDetails';
import { AwxRolePage } from '../../frontend/awx/access/roles/AwxRolePage';
import {
  CreateRole as CreateAwxRole,
  EditRole as EditAwxRole,
} from '../../frontend/awx/access/roles/RoleForm';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { EdaRoleDetails } from '../../frontend/eda/access/roles/EdaRoleDetails';
import { EdaRolePage } from '../../frontend/eda/access/roles/EdaRolePage';
import { CreateRole, EditRole } from '../../frontend/eda/access/roles/RoleForm';
import { EdaRoute } from '../../frontend/eda/main/EdaRoutes';
import { RoleDetails } from '../../frontend/hub/access/roles/RolePage/RoleDetails';
import {
  CreateRole as CreateRoleHub,
  EditRole as EditRoleHub,
} from '../../frontend/hub/access/roles/RolePage/RoleForm';
import { RolePage } from '../../frontend/hub/access/roles/RolePage/RolePage';
import { HubRoute } from '../../frontend/hub/main/HubRoutes';
import { PlatformAwxRoles } from '../access/roles/PlatformAwxRoles';
import { PlatformEdaRoles } from '../access/roles/PlatformEdaRoles';
import { PlatformHubRoles } from '../access/roles/PlatformHubRoles';
import { PlatformRoles } from '../access/roles/PlatformRoles';
import { PlatformRoute } from '../main/PlatformRoutes';

export function useGetPlatformRolesRoutes() {
  const { t } = useTranslation();
  const rolesRoutes = useMemo<PageNavigationItem[]>(
    () => [
      {
        id: PlatformRoute.Roles,
        label: t('Roles'),
        path: 'roles',
        element: <PlatformRoles />,
        children: [
          {
            id: AwxRoute.Roles,
            path: 'controller',
            element: <PlatformAwxRoles />,
          },
          {
            id: EdaRoute.Roles,
            path: 'eda',
            element: <PlatformEdaRoles />,
          },
          {
            id: HubRoute.Roles,
            path: 'hub',
            element: <PlatformHubRoles />,
          },
          {
            path: '',
            element: <Navigate to="controller" />,
          },
        ],
      },
      {
        id: AwxRoute.Roles,
        path: 'roles/controller',
        children: [
          {
            id: AwxRoute.CreateRole,
            path: 'create',
            element: (
              <CreateAwxRole breadcrumbLabelForPreviousPage={t('Automation Execution Roles')} />
            ),
          },
          {
            id: AwxRoute.EditRole,
            path: ':id/edit',
            element: (
              <EditAwxRole breadcrumbLabelForPreviousPage={t('Automation Execution Roles')} />
            ),
          },
          {
            id: AwxRoute.RolePage,
            path: ':id',
            element: (
              <AwxRolePage
                breadcrumbLabelForPreviousPage={t('Automation Execution Roles')}
                backTabLabel={t('Back to Automation Execution Roles')}
              />
            ),
            children: [
              {
                id: AwxRoute.RoleDetails,
                path: 'details',
                element: <AwxRoleDetails />,
              },
              {
                path: '',
                element: <Navigate to="details" />,
              },
            ],
          },
        ],
      },
      {
        id: EdaRoute.Roles,
        path: 'roles/eda',
        children: [
          {
            id: EdaRoute.CreateRole,
            path: 'create',
            element: (
              <CreateRole breadcrumbLabelForPreviousPage={t('Automation Decisions Roles')} />
            ),
          },
          {
            id: EdaRoute.EditRole,
            path: ':id/edit',
            element: <EditRole breadcrumbLabelForPreviousPage={t('Automation Decisions Roles')} />,
          },
          {
            id: EdaRoute.RolePage,
            path: ':id',
            element: (
              <EdaRolePage
                breadcrumbLabelForPreviousPage={t('Automation Decisions Roles')}
                backTabLabel={t('Back to Automation Decisions Roles')}
              />
            ),
            children: [
              {
                id: EdaRoute.RoleDetails,
                path: 'details',
                element: <EdaRoleDetails />,
              },
            ],
          },
        ],
      },
      {
        id: HubRoute.Roles,
        path: 'roles/hub',
        children: [
          {
            id: HubRoute.CreateRole,
            path: 'create',
            element: (
              <CreateRoleHub breadcrumbLabelForPreviousPage={t('Automation Content Roles')} />
            ),
          },
          {
            id: HubRoute.EditRole,
            path: ':id/edit',
            element: <EditRoleHub breadcrumbLabelForPreviousPage={t('Automation Content Roles')} />,
          },
          {
            id: HubRoute.RolePage,
            path: ':id',
            element: (
              <RolePage
                breadcrumbLabelForPreviousPage={t('Automation Content Roles')}
                backTabLabel={t('Back to Automation Content Roles')}
              />
            ),
            children: [
              {
                id: HubRoute.RoleDetails,
                path: 'details',
                element: <RoleDetails />,
              },
              {
                path: '',
                element: <Navigate to="details" />,
              },
            ],
          },
        ],
      },
    ],
    [t]
  );
  return rolesRoutes;
}
