import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable } from '../../../../framework';
import { LoadingState } from '../../../../framework/components/LoadingState';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import {
  useOrganizationAdminsRowActions,
  useOrganizationAdminsToolbarActions,
} from '../hooks/useOrganizationAdminsActions';

export function PlatformOrganizationAdmins() {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    isLoading,
    error,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/organizations`, params.id);

  const view = usePlatformView<PlatformUser>({
    url: gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/admins/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: organizationOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/`);
  const canEditOrganization = Boolean(
    organizationOptions &&
      organizationOptions.actions &&
      (organizationOptions.actions['PUT'] || organizationOptions.actions['PATCH'])
  );
  const toolbarActions = useOrganizationAdminsToolbarActions(view);
  const rowActions = useOrganizationAdminsRowActions(view);

  if (isLoading || isLoadingOptions) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformUser>
      id="platform-organization-admins-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading administrators')}
      emptyStateTitle={
        canEditOrganization
          ? t('There are currently no administrators added to this organization.')
          : t('You do not have permission to add an administrator to this organization.')
      }
      emptyStateDescription={
        canEditOrganization
          ? t('Add administrators by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditOrganization ? undefined : CubesIcon}
      emptyStateButtonText={canEditOrganization ? t('Add administrators') : undefined}
      emptyStateActions={canEditOrganization ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
