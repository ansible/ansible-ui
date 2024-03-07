import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../../framework/PageNavigation/PageNavigationItem';
import { PageSettings } from '../../../framework/PageSettings/PageSettings';
import { AwxRoleDetails } from '../access/roles/AwxRoleDetails';
import { AwxRolePage } from '../access/roles/AwxRolePage';
import { AwxRoles } from '../access/roles/AwxRoles';
import { AwxSettings } from '../administration/settings/AwxSettings';
import {
  AwxSettingsCategory,
  AwxSettingsCategoryRoute,
} from '../administration/settings/AwxSettingsCategory';
import { Topology } from '../administration/topology/Topology';
import { Reports } from '../analytics/Reports/Reports';
import { SubscriptionUsage } from '../analytics/subscription-usage/SubscriptionUsage';
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
  const navigationItems: PageNavigationItem[] = [
    {
      id: AwxRoute.Overview,
      label: t('Overview'),
      path: 'overview',
      element: <AwxOverview />,
    },
    awxJobsRoutes,
    awxTemplateRoutes,
    awxSchedulesRoutes,
    awxProjectRoutes,
    {
      label: t('Infrastructure'),
      path: 'infrastructure',
      children: [
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
      ],
    },
    {
      id: AwxRoute.Analytics,
      label: t('Analytics'),
      path: 'analytics',
      children: [
        // {
        //   id: AwxRoute.Reports,
        //   label: t('Reports'),
        //   path: 'reports',
        //   element: <ReportsList />,
        // },
        {
          id: AwxRoute.AutomationCalculator,
          label: t('Automation Calculator'),
          path: 'automation-calculator',
          element: <Reports />,
        },
        // {
        //   id: AwxRoute.AnalyticsBuilder,
        //   label: t('Analytics builder'),
        //   path: 'builder',
        //   element: <Test />,
        // },
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
    {
      label: t('Administration'),
      path: 'administration',
      children: [
        awxActivityStreamRoutes,
        awxWorkflowApprovalRoutes,
        awxNotificationsRoutes,
        awxManagementJobsRoutes,
        awxApplicationsRoutes,
      ],
    },
    {
      id: AwxRoute.Access,
      label: t('Access'),
      path: 'access',
      children: [
        {
          id: AwxRoute.SettingsAuthentication,
          label: t('Authentication'),
          path: 'authentication',
          children: [
            {
              id: AwxRoute.SettingsCategory,
              path: ':category',
              element: <AwxSettingsCategoryRoute />,
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
              id: AwxRoute.Role,
              path: ':resourceType/:id',
              element: <AwxRolePage />,
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
              path: '',
              element: <AwxRoles />,
            },
          ],
        },
        awxCredentialRoutes,
        awxCredentialTypesRoutes,
      ],
    },
    {
      id: AwxRoute.Settings,
      label: t('Settings'),
      path: 'settings',
      children: [
        {
          id: AwxRoute.SettingsPreferences,
          label: t('User Preferences'),
          path: 'preferences',
          element: <PageSettings />,
        },
        {
          id: AwxRoute.SettingsSystem,
          label: t('System'),
          path: 'system',
          element: <AwxSettingsCategory categoryId="system" key="system" />,
        },
        {
          id: AwxRoute.SettingsJobs,
          label: t('Job'),
          path: 'job-settings',
          element: <AwxSettingsCategory categoryId="jobs" key="jobs" />,
        },
        {
          id: AwxRoute.SettingsLogging,
          label: t('Logging'),
          path: 'logging',
          element: <AwxSettingsCategory categoryId="logging" key="logging" />,
        },
        {
          id: AwxRoute.SettingsCustomizeLogin,
          label: t('Customize Login'),
          path: 'customize-login',
          element: <AwxSettingsCategory categoryId="ui" key="ui" />,
        },
        {
          id: AwxRoute.SettingsTroubleshooting,
          label: t('Troubleshooting'),
          path: 'troubleshooting',
          element: <AwxSettingsCategory categoryId="debug" key="debug" />,
        },
        {
          path: '',
          element: <Navigate to=".." />,
        },
      ],
    },
    {
      path: '',
      element: <Navigate to={'./overview'} />,
    },
  ];
  return navigationItems;
}
