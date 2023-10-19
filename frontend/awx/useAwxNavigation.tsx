import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  PageNavigationItem,
  removeLeadingSlash,
} from '../../framework/PageNavigation/PageNavigationItem';
import { PageNotImplemented } from '../common/PageNotImplemented';
import { AwxLogin } from './AwxLogin';
import { AwxRoute } from './AwxRoutes';
import Reports from './analytics/Reports/Reports';
import { Test } from './analytics/AnalyticsReportBuilder/Test';
import ReportsList from './analytics/Reports/ReportsList';
import SubscriptionUsage from './analytics/subscription-usage/SubscriptionUsage';
import { AwxDashboard } from './dashboard/AwxDashboard';
import Settings from './settings/Settings';
import HostMetrics from './views/jobs/HostMetrics';
import { useGetAwxInventoryRoutes } from './useGetAwxInventoryRoutes';
import { useGetAwxHostRoutes } from './useGetAwxHostRoutes';
import { useGetAwxProjectRoutes } from './useGetAwxProjectRoutes';
import { useGetAwxCredentialRoutes } from './useGetAwxCredentialRoutes';
import { useGetAwxTemplateRoutes } from './useGetAwxTemplateRoutes';
import { useGetAwxWorkflowApprovalRoutes } from './useGetAwxWorkflowApprovalRoutes';
import { useGetAwxJobsRoutes } from './useGetAwxJobsRoutes';
import { useGetAwxSchedulesRoutes } from './useGetAwxSchedulesRoutes';
import { useGetAwxActivityStreamRoutes } from './useGetAwxActivityStream';
import { useGetAwxOrganizationRoutes } from './useGetAwxOrganizationsRoutes';
import { useGetAwxTeamsRoutes } from './useGetAwxTeamsRoutes';
import { useGetAwxUsersRoutes } from './useGetAwxUsersRoutes';
import { useGetAwxNotificationsRoutes } from './useGetAwxNotificationsRoutes';
import { useGetAwxManagementJobsRoutes } from './useGetAwxManagementJobsRoutes';
import { useGetAwxInstanceGroupsRoutes } from './useGetAwxInstanceGroupsRoutes';
import { useGetAwxInstancesRoutes } from './useGetAwxInstancesRoutes';
import { useGetAwxApplicationsRoutes } from './useGetAwxApplicationsRoutes';
import { useGetAwxExecutionEnvironmentRoutes } from './useGetAwxExecutionEnironmentRoutes';
import { useGetAwxCredentialTypesRoutes } from './useGetAwxCredentialTypesRoutes';

export function useAwxNavigation() {
  const { t } = useTranslation();
  const awxInventoryRoutes = useGetAwxInventoryRoutes();
  const awxHostRoutes = useGetAwxHostRoutes();
  const awxProjectRoutes = useGetAwxProjectRoutes();
  const awxCredentialRoutes = useGetAwxCredentialRoutes();
  const awxTemplateRoutes = useGetAwxTemplateRoutes();
  const awxWorkflowApprovalRoutes = useGetAwxWorkflowApprovalRoutes();
  const awxSchedulesRoutes = useGetAwxSchedulesRoutes();
  const awxJobsRoutes = useGetAwxJobsRoutes();
  const awxActivityStreamRoutes = useGetAwxActivityStreamRoutes();
  const awxOrganizationRoutes = useGetAwxOrganizationRoutes();
  const awxTeamsRoutes = useGetAwxTeamsRoutes();
  const awxUsersRoutes = useGetAwxUsersRoutes();
  const awxNotificationsRoutes = useGetAwxNotificationsRoutes();
  const awxManagementJobsRoutes = useGetAwxManagementJobsRoutes();
  const awxInstanceGroupsRoutes = useGetAwxInstanceGroupsRoutes();
  const awxInstancesRoutes = useGetAwxInstancesRoutes();
  const awxApplicationsRoutes = useGetAwxApplicationsRoutes();
  const awxExecutionEnvironmentsRoutes = useGetAwxExecutionEnvironmentRoutes();
  const awxCredentialTypesRoutes = useGetAwxCredentialTypesRoutes();
  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems: PageNavigationItem[] = [
      {
        id: AwxRoute.Login,
        path: 'login',
        element: <AwxLogin />,
      },
      {
        label: '',
        path: removeLeadingSlash(process.env.AWX_ROUTE_PREFIX),
        children: [
          {
            id: AwxRoute.Dashboard,
            label: t('Dashboard'),
            path: 'dashboard',
            element: <AwxDashboard />,
          },
          {
            label: t('Views'),
            path: 'views',
            children: [
              awxJobsRoutes,
              awxSchedulesRoutes,
              awxWorkflowApprovalRoutes,
              awxActivityStreamRoutes,
            ],
          },
          {
            label: t('Resources'),
            path: 'resources',
            children: [
              awxTemplateRoutes,
              awxCredentialRoutes,
              awxProjectRoutes,
              awxInventoryRoutes,
              awxHostRoutes,
            ],
          },
          {
            label: t('Access'),
            path: 'access',
            children: [awxOrganizationRoutes, awxTeamsRoutes, awxUsersRoutes],
          },
          {
            label: t('Administration'),
            path: 'administration',
            children: [
              awxCredentialTypesRoutes,
              awxNotificationsRoutes,
              awxManagementJobsRoutes,
              awxInstanceGroupsRoutes,
              awxInstancesRoutes,
              awxApplicationsRoutes,
              awxExecutionEnvironmentsRoutes,
              {
                id: AwxRoute.TopologyView,
                label: 'Topology View',
                path: 'topology',
                element: <PageNotImplemented />,
              },
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
                id: 'TestAnalyticsBuilder',
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
            id: AwxRoute.Settings,
            label: t('Settings'),
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
      {
        id: AwxRoute.Awx,
        path: '',
        element: (
          <Navigate
            to={
              process.env.AWX_ROUTE_PREFIX
                ? process.env.AWX_ROUTE_PREFIX + '/dashboard'
                : 'dashboard'
            }
          />
        ),
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
