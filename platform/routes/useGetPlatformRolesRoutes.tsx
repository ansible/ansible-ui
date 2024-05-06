import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework';
import { PlatformRoute } from '../main/PlatformRoutes';
import { PlatformRoles } from '../access/roles/PlatformRoles';
import { AwxRoute } from '../../frontend/awx/main/AwxRoutes';
import { AwxRolePage } from '../../frontend/awx/access/roles/AwxRolePage';
import { AwxRoleDetails } from '../../frontend/awx/access/roles/AwxRoleDetails';
import { PlatformAwxRoles } from '../access/roles/PlatformAwxRoles';
import { EdaRoute } from '../../frontend/eda/main/EdaRoutes';
import { CreateRole, EditRole } from '../../frontend/eda/access/roles/RoleForm';
import {
  CreateRole as CreateRoleHub,
  EditRole as EditRoleHub,
} from '../../frontend/hub/access/roles/RolePage/RoleForm';
import { EdaRolePage } from '../../frontend/eda/access/roles/EdaRolePage';
import { EdaRoleDetails } from '../../frontend/eda/access/roles/EdaRoleDetails';
import { PlatformEdaRoles } from '../access/roles/PlatformEdaRoles';
import { HubRoute } from '../../frontend/hub/main/HubRoutes';
import { RolePage } from '../../frontend/hub/access/roles/RolePage/RolePage';
import { RoleDetails } from '../../frontend/hub/access/roles/RolePage/RoleDetails';
import { PlatformHubRoles } from '../access/roles/PlatformHubRoles';

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
        id: AwxRoute.Role,
        path: 'controller/:resourceType/:id',
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
      {
        id: EdaRoute.CreateRole,
        path: 'eda/create',
        element: <CreateRole breadcrumbLabelForPreviousPage={t('Automation Decisions Roles')} />,
      },
      {
        id: EdaRoute.EditRole,
        path: 'eda/edit/:id',
        element: <EditRole breadcrumbLabelForPreviousPage={t('Automation Decisions Roles')} />,
      },
      {
        id: EdaRoute.RolePage,
        path: 'eda/:id/',
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
          {
            path: '',
            element: <Navigate to="details" />,
          },
        ],
      },
      {
        id: HubRoute.CreateRole,
        path: 'hub/create',
        element: <CreateRoleHub breadcrumbLabelForPreviousPage={t('Automation Content Roles')} />,
      },
      {
        id: HubRoute.EditRole,
        path: 'hub/:id/edit',
        element: <EditRoleHub breadcrumbLabelForPreviousPage={t('Automation Content Roles')} />,
      },
      {
        id: HubRoute.RolePage,
        path: 'hub/:id/',
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
    [t]
  );
  return rolesRoutes;
}
