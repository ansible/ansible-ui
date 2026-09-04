import { useGet } from '@ansible/common-ui/crud/useGet';
import { useCallback } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { Organization } from '../../../interfaces/Organization';

function hasOrganizations(response?: AwxItemsResponse<Organization>) {
  return (response?.results.length ?? 0) > 0;
}

export function useCanViewNotificationsTab() {
  const { activeAwxUser } = useAwxActiveUser();
  const isSystemAuditor = activeAwxUser?.is_system_auditor === true;
  const organizationsUrl = isSystemAuditor ? undefined : awxAPI`/organizations/`;
  const notificationAdmin = useGet<AwxItemsResponse<Organization>>(organizationsUrl, {
    role_level: 'notification_admin_role',
    count_disabled: 1,
  });
  const auditor = useGet<AwxItemsResponse<Organization>>(organizationsUrl, {
    role_level: 'auditor_role',
    count_disabled: 1,
  });
  const canViewNotificationsTab =
    isSystemAuditor || hasOrganizations(notificationAdmin.data) || hasOrganizations(auditor.data);
  const refresh = useCallback(() => {
    notificationAdmin.refresh();
    auditor.refresh();
  }, [notificationAdmin, auditor]);

  return {
    canViewNotificationsTab,
    error: canViewNotificationsTab ? undefined : notificationAdmin.error || auditor.error,
    isLoading: canViewNotificationsTab ? false : notificationAdmin.isLoading || auditor.isLoading,
    refresh,
  };
}
