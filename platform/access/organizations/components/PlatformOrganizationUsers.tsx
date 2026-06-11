import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { UserRoleAccess } from '@ansible/common-ui/access/interfaces/UserRoleAccess';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import {
  Alert,
  ButtonVariant,
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOrganizationUserColumns } from '../../users/hooks/useOrganizationUserColumns';
import { useOrganizationUsersFilters } from '../../users/hooks/useOrganizationUsersFilters';
import {
  useOrganizationUsersRowActions,
  useOrganizationUsersToolbarActions,
} from '../hooks/useOrganizationUsersActions';

export function PlatformOrganizationUsers() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationUsersFilters();
  const tableColumns = useOrganizationUserColumns();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const {
    data: organization,
    isLoading,
    error,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/organizations`, params.id);

  const view = usePlatformView<UserRoleAccess>({
    url: gatewayAPI`/role_user_access/shared.organization/${organization?.id?.toString() ?? ''}/`,
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
    <>
      <PageSection>
        <Alert
          isInline
          variant="info"
          title={t(
            `Below displays a list of users assigned to this organization and the organization roles they are directly assigned for this organization.`
          )}
        >
          <Content component={ContentVariants.p} style={{ paddingBottom: 0, marginBottom: 0 }}>
            {t(
              `When a user has a Team Member role, they inherit roles from the team they are assigned to. To view a user’s inherited organization roles and the team they are assigned to click on the user’s view and manage roles action. To modify these role assignments, manage the team’s assignments.`
            )}
          </Content>
        </Alert>
      </PageSection>
      <PageTable<UserRoleAccess>
        id="platform-organization-users-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyState={
          canEditOrganization ? (
            <PageTableEmptyState
              title={t('No users')}
              description={t(
                'To get started, assign users to this organization. Once users are ' +
                  'assigned to this organization, they can be assigned roles for the ' +
                  'resources within this organization.'
              )}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.OrganizationAssignUsers, {
                  params: { id: params.id },
                })}
              >
                {t('Assign users')}
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
    </>
  );
}
