import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { usePersistentFilters } from '../../../../frontend/common/PersistentFilters';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
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
  const pageNavigate = usePageNavigate();
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
        titleDocLink="https://docs.ansible.com"
      />
      <PageTable<PlatformUser>
        id="platform-users-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyStateTitle={
          canCreateUser
            ? t('There are currently no users added.')
            : t('You do not have permission to create a user')
        }
        emptyStateDescription={
          canCreateUser
            ? t('Please create a user by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateUser ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateUser ? t('Create user') : undefined}
        emptyStateButtonClick={
          canCreateUser ? () => pageNavigate(PlatformRoute.CreateUser) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
