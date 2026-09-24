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
