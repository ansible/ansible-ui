import { useGet } from '@ansible/common-ui/crud/useGet';
import { Organization } from '../interfaces/Organization';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

/** Organizations where the active user can manage notification templates. */
export function useNotificationAdminOrganizations() {
  const { data, isLoading } = useGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/`,
    {
      role_level: 'add_notificationtemplate',
      count_disabled: 1,
    },
    {
      // Optional tab visibility check — do not retry or block the page on failure.
      shouldRetryOnError: false,
    }
  );

  return {
    notificationAdminOrganizations: data,
    isLoadingNotificationAdminOrganizations: isLoading,
  };
}

export function canViewNotificationsTab(
  activeAwxUser: { is_system_auditor?: boolean } | null | undefined,
  notificationAdminOrganizations?: AwxItemsResponse<Organization>
) {
  return (
    !!activeAwxUser?.is_system_auditor || (notificationAdminOrganizations?.results.length ?? 0) > 0
  );
}
