import { usePlatformActiveUser } from '@ansible/platform-ui/main/PlatformActiveUserProvider';

/**
 * Only superusers may edit the automation analytics settings; platform auditors can view them.
 * Shared by the settings nav (edit route) and the details page (Edit button).
 */
export function useCanEditAutomationAnalyticsSettings() {
  const { activePlatformUser } = usePlatformActiveUser();
  return !!activePlatformUser?.is_superuser;
}
