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
import { useGatewayService } from '../main/GatewayServices';

export function useGetPlatformRolesRoutes() {
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const hubService = useGatewayService('hub');

  const rolesRoutes = useMemo<PageNavigationItem[]>(() => {
    const parentRoutes = [] as PageNavigationItem[];
    const childRoutes = [] as PageNavigationItem[];
    let defaultRoleRoute = null;

    if (awxService) {
      childRoutes.push({
        id: AwxRoute.Roles,
        path: 'controller',
        element: <PlatformAwxRoles />,
      });
      parentRoutes.push({
        id: AwxRoute.Roles,
        path: 'roles/controller',
        children: [
          {
            id: AwxRoute.CreateRole as string,
            path: 'create',
            element: (
              <CreateAwxRole breadcrumbLabelForPreviousPage={t('Automation Execution Roles')} />
            ),
          },
          {
            id: AwxRoute.EditRole as string,
            path: ':id/edit',
            element: (
              <EditAwxRole breadcrumbLabelForPreviousPage={t('Automation Execution Roles')} />
            ),
          },
          {
            id: AwxRoute.RolePage as string,
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
      });
      defaultRoleRoute = 'controller';
    }
    if (edaService) {
      childRoutes.push({
        id: EdaRoute.Roles,
        path: 'eda',
        element: <PlatformEdaRoles />,
      });
      parentRoutes.push({
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
      });
      defaultRoleRoute ??= 'eda';
    }
    if (hubService) {
      childRoutes.push({
        id: HubRoute.Roles,
        path: 'hub',
        element: <PlatformHubRoles />,
      });
      parentRoutes.push({
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
      });
      defaultRoleRoute ??= 'hub';
    }

    childRoutes.push({
      path: '',
      element: <Navigate to={defaultRoleRoute as string} />,
    });

    parentRoutes.unshift({
      id: PlatformRoute.Roles,
      label: t('Roles'),
      path: 'roles',
      element: <PlatformRoles />,
      children: childRoutes,
    });

    return parentRoutes;
  }, [awxService, edaService, hubService, t]);
  return rolesRoutes;
}
