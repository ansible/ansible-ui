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
  useOrganizationUsersRowActions,
  useOrganizationUsersToolbarActions,
} from '../hooks/useOrganizationUsersActions';

export function PlatformAAPOrganizationUsers() {
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
    url: gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/users/`,
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
  const toolbarActions = useOrganizationUsersToolbarActions(view);
  const rowActions = useOrganizationUsersRowActions(view);

  if (isLoading || isLoadingOptions) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformUser>
      id="platform-organization-users-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={
        canEditOrganization
          ? t('There are currently no users added to this organization.')
          : t('You do not have permission to add a user to this organization.')
      }
      emptyStateDescription={
        canEditOrganization
          ? t('Add users by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditOrganization ? undefined : CubesIcon}
      emptyStateButtonText={canEditOrganization ? t('Add user(s)') : undefined}
      emptyStateActions={canEditOrganization ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
