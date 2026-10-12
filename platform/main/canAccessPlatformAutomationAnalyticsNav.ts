import type { AwxUser } from '@ansible/awx-ui/interfaces/User';
import type { PlatformUser } from '../interfaces/PlatformUser';

export type PlatformAutomationAnalyticsNavUserContext = {
  activePlatformUser?: PlatformUser | null;
  activeAwxUser?: AwxUser | null;
  isPlatformUserPending?: boolean;
  isAwxUserPending?: boolean;
};

/** Platform sidebar: Automation Analytics is limited to admin/auditor roles (persona views). */
export function canAccessPlatformAutomationAnalyticsNav(
  context: PlatformAutomationAnalyticsNavUserContext
): boolean {
  if (context.isPlatformUserPending || context.isAwxUserPending) {
    return false;
  }
  return (
    !!context.activePlatformUser?.is_superuser ||
    !!context.activePlatformUser?.is_platform_auditor ||
    !!context.activeAwxUser?.is_superuser ||
    !!context.activeAwxUser?.is_system_auditor
  );
}
