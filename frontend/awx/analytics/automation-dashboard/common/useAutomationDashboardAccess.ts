import { IFilterState } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardAccess, IAutomationDashboardOrganizationAccess } from '../types';

export function useAutomationDashboardAccess() {
  const { data, isLoading, error } = useGet<IAutomationDashboardAccess>(
    metricsAPI`/dashboard_reports/access/`
  );

  return { access: data, isLoading, error };
}

export function getDashboardSettingsOrganization(
  access: IAutomationDashboardAccess | undefined,
  filterState: IFilterState
): IAutomationDashboardOrganizationAccess | undefined {
  if (!access) return undefined;

  const selectedIds = filterState.organization ?? [];
  let organizationId: string | undefined;
  if (selectedIds.length === 1) {
    organizationId = selectedIds[0];
  } else if (selectedIds.length === 0 && access.organizations.length === 1) {
    organizationId = String(access.organizations[0].id);
  }

  return access.organizations.find((organization) => String(organization.id) === organizationId);
}

export function getDashboardSettingsContext(
  access: IAutomationDashboardAccess | undefined,
  filterState: IFilterState,
  isPlatformSuperuser: boolean,
  isPlatformAuditor: boolean
): {
  organization: IAutomationDashboardOrganizationAccess | undefined;
  useGlobalSettings: boolean;
  canEditSettings: boolean;
} {
  if (isPlatformSuperuser || isPlatformAuditor) {
    return {
      organization: undefined,
      useGlobalSettings: true,
      canEditSettings: isPlatformSuperuser,
    };
  }

  if (access?.scope === 'global') {
    return {
      organization: undefined,
      useGlobalSettings: true,
      canEditSettings: false,
    };
  }

  const organization = getDashboardSettingsOrganization(access, filterState);
  return {
    organization,
    useGlobalSettings: false,
    canEditSettings: organization?.can_edit === true,
  };
}

/**
 * Whether the caller may create/update saved reports.
 *
 * Saving a report requires change (`change_organization`) permission on every
 * organization the report covers. Organization members with view-only access
 * can still view the dashboard, but the save-report action is unavailable.
 */
export function getCanSaveReports(
  access: IAutomationDashboardAccess | undefined,
  filterState: IFilterState,
  isPlatformSuperuser: boolean,
  isPlatformAuditor: boolean
): boolean {
  // Platform auditors are read-only even though they have global visibility.
  if (isPlatformAuditor) return false;
  if (isPlatformSuperuser) return true;
  if (!access || access.scope !== 'organization' || access.organizations.length === 0) {
    return false;
  }

  const selectedIds = (filterState.organization ?? []).map(String);
  const targetOrganizations = selectedIds.length
    ? access.organizations.filter((organization) => selectedIds.includes(String(organization.id)))
    : access.organizations;

  // A selected organization the caller cannot see means the report is out of scope.
  if (
    selectedIds.length
      ? targetOrganizations.length !== selectedIds.length
      : targetOrganizations.length === 0
  ) {
    return false;
  }

  return targetOrganizations.every((organization) => organization.can_edit);
}
