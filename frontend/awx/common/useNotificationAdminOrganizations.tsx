import { useGet } from '@ansible/common-ui/crud/useGet';
import { Organization } from '../interfaces/Organization';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

/** Max orgs returned for role-filtered tab visibility (AWX default page size is smaller). */
const ORGANIZATION_ROLE_LOOKUP_PAGE_SIZE = 200;

const organizationRoleLookupQuery = {
  count_disabled: 1,
  page_size: ORGANIZATION_ROLE_LOOKUP_PAGE_SIZE,
};

/** Organizations where the active user can manage notification templates. */
export function useNotificationAdminOrganizations() {
  const { data, isLoading } = useGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/`,
    {
      role_level: 'add_notificationtemplate',
      ...organizationRoleLookupQuery,
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

export function shouldFetchAuditorOrganizations(
  activeAwxUser: { is_system_auditor?: boolean } | null | undefined,
  notificationAdminOrganizations?: AwxItemsResponse<Organization>,
  isLoadingNotificationAdminOrganizations?: boolean
) {
  if (activeAwxUser?.is_system_auditor) {
    return false;
  }
  if (isLoadingNotificationAdminOrganizations) {
    return false;
  }
  return !canViewNotificationsTab(activeAwxUser, notificationAdminOrganizations);
}

export function useTemplateNotificationsAccess(
  activeAwxUser: { is_system_auditor?: boolean } | null | undefined,
  templateOrganizationId: number | null | undefined
) {
  const { notificationAdminOrganizations, isLoadingNotificationAdminOrganizations } =
    useNotificationAdminOrganizations();
  const fetchAuditorOrganizations = shouldFetchAuditorOrganizations(
    activeAwxUser,
    notificationAdminOrganizations,
    isLoadingNotificationAdminOrganizations
  );
  const { data: auditorOrganizations, isLoading: isLoadingAuditorOrganizations } = useGet<
    AwxItemsResponse<Organization>
  >(
    fetchAuditorOrganizations ? awxAPI`/organizations/` : undefined,
    {
      role_level: 'auditor_role',
      ...organizationRoleLookupQuery,
    },
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
    isLoading:
      isLoadingNotificationAdminOrganizations ||
      (fetchAuditorOrganizations && isLoadingAuditorOrganizations),
  };
}
