import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useUsersFilters } from '../hooks/useUsersFilters';
import { useUsersColumns } from '../hooks/useUserColumns';
import { User } from '../../../interfaces/User';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { CubesIcon } from '@patternfly/react-icons';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useUserRowActions, useUserToolbarActions } from '../hooks/useUserActions';
import { useEffect } from 'react';

export function UsersList() {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<User>({
    url: '/api/gateway/v1/users',
    toolbarFilters,
    tableColumns,
  });

  // TODO: To be updated when API provides RBAC information
  const canCreateUser = true;
  const toolbarActions = useUserToolbarActions(view);
  const rowActions = useUserRowActions(view);

  console.log('abc');

  useEffect(() => console.log('useEffect: view changed'), [view]);
  useEffect(() => console.log('useEffect: tableColumns changed'), [tableColumns]);
  useEffect(() => console.log('useEffect: toolbarFilters changed'), [toolbarFilters]);

  return (
    <PageLayout>
      <PageHeader title={t('Users')} />
      <PageTable<User>
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
        emptyStateButtonText={canCreateUser ? t('Create user') : undefined}
        emptyStateButtonClick={
          canCreateUser ? () => pageNavigate(PlatformRoute.CreateUser) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
