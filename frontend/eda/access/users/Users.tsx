import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaUser } from '../../interfaces/EdaUser';
import { EdaRoute } from '../../main/EdaRoutes';
import { useUserActions } from './hooks/useUserActions';
import { useUserColumns } from './hooks/useUserColumns';
import { useUsersActions } from './hooks/useUsersActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function Users() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const tableColumns = useUserColumns();
  const view = useEdaView<EdaUser>({
    url: edaAPI`/users/`,
    tableColumns,
  });
  const toolbarActions = useUsersActions(view);
  const rowActions = useUserActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Users')}
        description={t(
          'A user is someone who has access to EDA with associated permissions and credentials.'
        )}
      />
      <PageTable
        id="eda-users-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyStateTitle={t('There are currently no users created for your organization.')}
        emptyStateDescription={t('Please create a user by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create user')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateUser)}
        {...view}
        defaultSubtitle={t('User')}
      />
    </PageLayout>
  );
}
