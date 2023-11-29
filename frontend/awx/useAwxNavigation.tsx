import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem } from '../../framework/PageNavigation/PageNavigationItem';
import { AwxRoute } from './AwxRoutes';
import { Topology } from './administration/topology/Topology';
import { Test } from './analytics/AnalyticsReportBuilder/Test';
import Reports from './analytics/Reports/Reports';
import ReportsList from './analytics/Reports/ReportsList/ReportsList';
import SubscriptionUsage from './analytics/subscription-usage/SubscriptionUsage';
import { AwxDashboard } from './dashboard/AwxDashboard';
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
import Settings from './settings/Settings';
import HostMetrics from './views/jobs/HostMetrics';

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
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        id: AwxRoute.Dashboard,
        label: t('Overview'),
        path: 'overview',
        element: <AwxDashboard />,
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
            label: 'Topology View',
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
          {
            id: AwxRoute.Reports,
            label: t('Reports'),
            path: 'reports',
            element: <ReportsList />,
          },
          {
            id: AwxRoute.AutomationCalculator,
            label: t('Automation Calculator'),
            path: 'automation-calculator',
            element: <Reports />,
          },
          {
            id: AwxRoute.AnalyticsBuilder,
            label: t('Analytics builder'),
            path: 'builder',
            element: <Test />,
          },
          {
            id: AwxRoute.HostMetrics,
            label: 'Host Metrics',
            path: 'host-metrics',
            element: <HostMetrics />,
          },
          {
            id: AwxRoute.SubscriptionUsage,
            label: 'Subscription Usage',
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
          {
            id: AwxRoute.Settings,
            label: t('Settings'),
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        id: AwxRoute.Access,
        label: t('Access'),
        path: 'access',
        children: [
          awxOrganizationRoutes,
          awxTeamsRoutes,
          awxUsersRoutes,
          awxCredentialRoutes,
          awxCredentialTypesRoutes,
        ],
      },
      {
        path: '',
        element: <Navigate to={'./overview'} />,
      },
    ];
    return navigationItems;
  }, [
    t,
    awxInventoryRoutes,
    awxCredentialRoutes,
    awxTemplateRoutes,
    awxHostRoutes,
    awxProjectRoutes,
    awxActivityStreamRoutes,
    awxApplicationsRoutes,
    awxExecutionEnvironmentsRoutes,
    awxInstanceGroupsRoutes,
    awxInstancesRoutes,
    awxJobsRoutes,
    awxManagementJobsRoutes,
    awxNotificationsRoutes,
    awxOrganizationRoutes,
    awxSchedulesRoutes,
    awxTeamsRoutes,
    awxUsersRoutes,
    awxWorkflowApprovalRoutes,
    awxCredentialTypesRoutes,
  ]);

  return pageNavigationItems;
}
