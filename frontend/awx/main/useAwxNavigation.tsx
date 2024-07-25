import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../framework/PageNavigation/PageNavigationItem';
import { PageSettingsDetails } from '../../../framework/PageSettings/PageSettingsDetails';
import { PageSettingsForm } from '../../../framework/PageSettings/PageSettingsForm';
import { AwxRoleDetails } from '../access/roles/AwxRoleDetails';
import { AwxRolePage } from '../access/roles/AwxRolePage';
import { AwxRoles } from '../access/roles/AwxRoles';
import { CreateRole, EditRole } from '../access/roles/RoleForm';
import { AwxSettings } from '../administration/settings/AwxSettings';
import { AwxSettingsCategoryDetailsPage } from '../administration/settings/AwxSettingsCategoryDetails';
import {
  AwxSettingsCategoryForm,
  AwxSettingsCategoryFormRoute,
} from '../administration/settings/AwxSettingsCategoryForm';
import { Topology } from '../administration/topology/Topology';
import { Reports } from '../analytics/Reports/Reports';
import { SubscriptionUsage } from '../analytics/subscription-usage/SubscriptionUsage';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxOverview } from '../overview/AwxOverview';
import { HostMetrics } from '../views/jobs/HostMetrics';
import { AwxRoute } from './AwxRoutes';
import { useAwxActivityStreamRoutes } from './routes/useAwxActivityStreamRoutes';
import { useAwxApplicationsRoutes } from './routes/useAwxApplicationsRoutes';
import { useAwxCredentialRoutes } from './routes/useAwxCredentialRoutes';
import { useAwxCredentialTypesRoutes } from './routes/useAwxCredentialTypesRoutes';
import { useAwxExecutionEnvironmentRoutes } from './routes/useAwxExecutionEnironmentRoutes';
import { useAwxHostRoutes } from './routes/useAwxHostRoutes';
import { useAwxInstanceGroupsRoutes } from './routes/useAwxInstanceGroupsRoutes';
import { useAwxInstancesRoutes } from './routes/useAwxInstancesRoutes';
import { useAwxInventoryRoutes } from './routes/useAwxInventoryRoutes';
import { useAwxJobsRoutes } from './routes/useAwxJobsRoutes';
import { useAwxManagementJobsRoutes } from './routes/useAwxManagementJobsRoutes';
import { useAwxNotificationsRoutes } from './routes/useAwxNotificationsRoutes';
import { useAwxOrganizationRoutes } from './routes/useAwxOrganizationsRoutes';
import { useAwxProjectRoutes } from './routes/useAwxProjectRoutes';
import { useAwxSchedulesRoutes } from './routes/useAwxSchedulesRoutes';
import { useAwxTeamsRoutes } from './routes/useAwxTeamsRoutes';
import { useAwxTemplateRoutes } from './routes/useAwxTemplateRoutes';
import { useAwxUsersRoutes } from './routes/useAwxUsersRoutes';
import { useAwxWorkflowApprovalRoutes } from './routes/useAwxWorkflowApprovalRoutes';

export function useAwxNavigation() {
  const { t } = useTranslation();
  const awxInventoryRoutes = useAwxInventoryRoutes();
  const awxHostRoutes = useAwxHostRoutes();
  const awxProjectRoutes = useAwxProjectRoutes();
  const awxCredentialRoutes = useAwxCredentialRoutes();
  const awxTemplateRoutes = useAwxTemplateRoutes();
  const awxWorkflowApprovalRoutes = useAwxWorkflowApprovalRoutes();
  const awxSchedulesRoutes = useAwxSchedulesRoutes();
  const awxJobsRoutes = useAwxJobsRoutes();
  const awxActivityStreamRoutes = useAwxActivityStreamRoutes();
  const awxOrganizationRoutes = useAwxOrganizationRoutes();
  const awxTeamsRoutes = useAwxTeamsRoutes();
  const awxUsersRoutes = useAwxUsersRoutes();
  const awxNotificationsRoutes = useAwxNotificationsRoutes();
  const awxManagementJobsRoutes = useAwxManagementJobsRoutes();
  const awxInstanceGroupsRoutes = useAwxInstanceGroupsRoutes();
  const awxInstancesRoutes = useAwxInstancesRoutes();
  const awxApplicationsRoutes = useAwxApplicationsRoutes();
  const awxExecutionEnvironmentsRoutes = useAwxExecutionEnvironmentRoutes();
  const awxCredentialTypesRoutes = useAwxCredentialTypesRoutes();
  const { activeAwxUser } = useAwxActiveUser();

  const overview: PageNavigationItem[] = [
    {
      id: AwxRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <AwxOverview />,
    },
  ];
  const infrastructureItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Infrastructure,
      label: t('Infrastructure'),
      path: 'infrastructure',
      children: activeAwxUser?.is_superuser
        ? [
            {
              id: AwxRoute.TopologyView,
              label: t('Topology View'),
              path: 'topology',
              element: <Topology />,
            },
            awxInventoryRoutes,
            awxHostRoutes,
            awxInstanceGroupsRoutes,
            awxInstancesRoutes,
            awxExecutionEnvironmentsRoutes,
          ]
        : [
            awxInventoryRoutes,
            awxHostRoutes,
            awxInstanceGroupsRoutes,
            awxInstancesRoutes,
            awxExecutionEnvironmentsRoutes,
          ],
    },
  ];
  const analyticsItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Analytics,
      label: t('Analytics'),
      path: 'analytics',
      children: [
        {
          id: AwxRoute.AutomationCalculator,
          label: t('Automation Calculator'),
          path: 'automation-calculator',
          element: <Reports />,
        },
        {
          id: AwxRoute.HostMetrics,
          label: t('Host Metrics'),
          path: 'host-metrics',
          element: <HostMetrics />,
        },
        {
          id: AwxRoute.SubscriptionUsage,
          label: t('Subscription Usage'),
          path: 'subscription-usage',
          element: <SubscriptionUsage />,
        },
      ],
    },
  ];
  const administrationItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Administration,
      label: t('Administration'),
      path: 'administration',
      children: activeAwxUser?.is_superuser
        ? [
            awxActivityStreamRoutes,
            awxWorkflowApprovalRoutes,
            awxNotificationsRoutes,
            awxManagementJobsRoutes,
            awxApplicationsRoutes,
          ]
        : [awxActivityStreamRoutes, awxWorkflowApprovalRoutes, awxApplicationsRoutes],
    },
  ];
  const accessItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Access,
      label: t('Access Management'),
      path: 'access',
      children: [
        {
          id: AwxRoute.SettingsAuthentication,
          label: t('Authentication Methods'),
          path: 'authentication',
          children: [
            {
              id: AwxRoute.SettingsCategory,
              path: ':category/edit',
              element: <AwxSettingsCategoryFormRoute />,
            },
            {
              path: '',
              element: <AwxSettings />,
            },
          ],
        },
        awxOrganizationRoutes,
        awxTeamsRoutes,
        awxUsersRoutes,
        {
          id: AwxRoute.Roles,
          label: t('Roles'),
          path: 'roles',
          children: [
            {
              id: AwxRoute.CreateRole,
              path: 'create',
              element: <CreateRole />,
            },
            {
              id: AwxRoute.EditRole,
              path: ':id/edit',
              element: <EditRole />,
            },
            {
              id: AwxRoute.RolePage,
              path: ':id',
              element: <AwxRolePage />,
              children: [
                {
                  id: AwxRoute.RoleDetails,
                  path: 'details',
                  element: <AwxRoleDetails />,
                },
                {
                  path: '',
                  element: <Navigate to="details" replace />,
                },
              ],
            },
            {
              path: '',
              element: <AwxRoles />,
            },
          ],
        },
        awxCredentialRoutes,
        awxCredentialTypesRoutes,
      ],
    },
  ];
  const settingsItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Settings,
      label: t('Settings'),
      path: 'settings',
      children: [
        {
          id: AwxRoute.SettingsPreferences,
          label: t('User Preferences'),
          path: 'preferences',
          children: [
            {
              path: 'edit',
              element: <PageSettingsForm />,
            },
            {
              path: '',
              element: <PageSettingsDetails />,
            },
          ],
        },
        {
          id: AwxRoute.SettingsSystem,
          label: t('System'),
          path: 'system',
          children: [
            {
              path: 'edit',
              element: <AwxSettingsCategoryForm categoryId="system" key="system" />,
            },
            {
              path: '',
              element: <AwxSettingsCategoryDetailsPage categoryId="system" key="system" />,
            },
          ],
        },
        {
          id: AwxRoute.SettingsJobs,
          label: t('Job'),
          path: 'job-settings',
          children: [
            {
              path: 'edit',
              element: <AwxSettingsCategoryForm categoryId="jobs" key="jobs" />,
            },
            {
              path: '',
              element: <AwxSettingsCategoryDetailsPage categoryId="jobs" key="jobs" />,
            },
          ],
        },
        {
          id: AwxRoute.SettingsLogging,
          label: t('Logging'),
          path: 'logging',
          children: [
            {
              path: 'edit',
              element: <AwxSettingsCategoryForm categoryId="logging" key="logging" />,
            },
            {
              path: '',
              element: <AwxSettingsCategoryDetailsPage categoryId="logging" key="logging" />,
            },
          ],
        },
        {
          id: AwxRoute.SettingsTroubleshooting,
          label: t('Troubleshooting'),
          path: 'troubleshooting',
          children: [
            {
              path: 'edit',
              element: <AwxSettingsCategoryForm categoryId="debug" key="debug" />,
            },
            {
              path: '',
              element: <AwxSettingsCategoryDetailsPage categoryId="debug" key="debug" />,
            },
          ],
        },
        {
          path: '',
          element: <Navigate to=".." replace />,
        },
      ],
    },
  ];

  const navigationItems = [
    ...overview,
    awxJobsRoutes,
    awxTemplateRoutes,
    awxSchedulesRoutes,
    awxProjectRoutes,
    ...infrastructureItems,
    ...(activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor ? analyticsItems : []),
    ...administrationItems,
    ...accessItems,
    ...settingsItems,
    {
      path: '',
      element: <Navigate to={'./overview'} replace />,
    },
  ];

  return navigationItems;
}
