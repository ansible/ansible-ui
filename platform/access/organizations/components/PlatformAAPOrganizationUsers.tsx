import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
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
  const getPageUrl = useGetPageUrl();
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
      emptyState={
        canEditOrganization ? (
          <PageTableEmptyState
            title={t('There are currently no users added to this organization.')}
            description={t('Add users by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(PlatformRoute.OrganizationAddUsers, { params: { id: params.id } })}
            >
              {t('Add user(s)')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={t('You do not have permission to add a user to this organization.')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      {...view}
    />
  );
}
