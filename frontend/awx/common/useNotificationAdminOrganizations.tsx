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

export function getTemplateNotificationsAccess(
  activeAwxUser: { is_system_auditor?: boolean } | null | undefined,
  templateOrganizationId: number | null | undefined,
  notificationAdminOrganizations?: AwxItemsResponse<Organization>,
  auditorOrganizations?: AwxItemsResponse<Organization>
) {
  const managerAccess = canViewNotificationsTab(activeAwxUser, notificationAdminOrganizations);
  const isAuditorOfTemplateOrganization =
    typeof templateOrganizationId === 'number' &&
    auditorOrganizations?.results.some(
      (organization) => organization.id === templateOrganizationId
    ) === true;

  return {
    canView: managerAccess || isAuditorOfTemplateOrganization,
    readOnly: !managerAccess && isAuditorOfTemplateOrganization,
  };
}

export function useTemplateNotificationsAccess(
  activeAwxUser: { is_system_auditor?: boolean } | null | undefined,
  templateOrganizationId: number | null | undefined
) {
  const { notificationAdminOrganizations, isLoadingNotificationAdminOrganizations } =
    useNotificationAdminOrganizations();
  const { data: auditorOrganizations, isLoading: isLoadingAuditorOrganizations } = useGet<
    AwxItemsResponse<Organization>
  >(
    awxAPI`/organizations/`,
    { role_level: 'auditor_role', count_disabled: 1 },
    { shouldRetryOnError: false }
  );
  const access = getTemplateNotificationsAccess(
    activeAwxUser,
    templateOrganizationId,
    notificationAdminOrganizations,
    auditorOrganizations
  );

  return {
    ...access,
    isLoading: isLoadingNotificationAdminOrganizations || isLoadingAuditorOrganizations,
  };
}
