import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { AutomationAnalyticsSettingsDetails } from '@ansible/awx-ui/analytics/automation-dashboard/AutomationAnalyticsSettingsDetails';
import { AutomationAnalyticsSettingsEdit } from '@ansible/awx-ui/analytics/automation-dashboard/AutomationAnalyticsSettingsEdit';
import { useCanEditAutomationAnalyticsSettings } from '@ansible/awx-ui/analytics/automation-dashboard/common/useCanEditAutomationAnalyticsSettings';
import { useAutomationDashboardCollectionStatus } from '@ansible/awx-ui/analytics/automation-dashboard/common/useAutomationDashboardCollectionStatus';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { useTranslation } from 'react-i18next';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

/**
 * Settings > Automation Analytics; hidden without a metrics service or for non-admin users.
 * Auditors can view it, but only users who can edit get the edit route (others hit the 404 page).
 */
export function useAutomationAnalyticsSettingsNavigation(): PageNavigationItem {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const { isUnavailable: isMetricsUnavailable } = useAutomationDashboardCollectionStatus();
  const canEdit = useCanEditAutomationAnalyticsSettings();
  const isAdmin = !!(activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor);

  return {
    id: AwxRoute.SettingsAutomationAnalytics,
    label: t('Automation Analytics'),
    path: 'automation-analytics',
    children: [
      ...(canEdit ? [{ path: 'edit', element: <AutomationAnalyticsSettingsEdit /> }] : []),
      { path: '', element: <AutomationAnalyticsSettingsDetails /> },
    ],
    hidden: isMetricsUnavailable || !isAdmin,
  };
}
