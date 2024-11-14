import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetDocsUrl } from '@ansible/awx-ui/common/util/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUserRowActions, useUserToolbarActions } from '../hooks/useUserActions';
import { useUsersColumns } from '../hooks/useUserColumns';
import { useUsersFilters } from '../hooks/useUsersFilters';

export function PlatformUsersList() {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('users');

  const view = usePlatformView<PlatformUser>({
    url: gatewayAPI`/users/`,
    toolbarFilters,
    tableColumns,
  });

  const {
    data,
    isLoading: isLoadingOptions,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/users/`);
  const canCreateUser = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useUserToolbarActions(view);
  const rowActions = useUserRowActions(view.unselectItemsAndRefresh);
  const docsLink = useGetDocsUrl(undefined, 'users');

  if (isLoadingOptions) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Users')}
        description={t(
          'A user is someone who has access with associated permissions and credentials.'
        )}
        titleHelpTitle={t('Users')}
        titleHelp={[
          t('A user is someone who has access with associated permissions and credentials.'),
        ]}
        titleDocLink={docsLink}
      />
      <PageTable<PlatformUser>
        id="platform-users-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyState={
          canCreateUser ? (
            <PageTableEmptyState
              title={t('There are currently no users added.')}
              description={t('Please create a user by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.CreateUser)}
              >
                {t('Create user')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a user')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
