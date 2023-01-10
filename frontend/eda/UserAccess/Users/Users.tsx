import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useInMemoryView } from '../../../../framework/useInMemoryView';
import { useGet } from '../../../common/useItem';
import { idKeyFn } from '../../../hub/usePulpView';
import { RouteE } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';
import { useUserActions } from './hooks/useUserActions';
import { useUserColumns } from './hooks/useUserColumns';
import { useUserFilters } from './hooks/useUserFilters';
import { useUsersActions } from './hooks/useUsersActions';

export function Users() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useUserFilters();
  const { data: users, mutate: refresh } = useGet<EdaUser[]>('/api/users');
  const tableColumns = useUserColumns();
  const view = useInMemoryView<EdaUser>({
    items: users,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  });
  const toolbarActions = useUsersActions(refresh);
  const rowActions = useUserActions(refresh);
  return (
    <PageLayout>
      <PageHeader title={t('Users')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading users')}
        emptyStateTitle={t('No users yet')}
        emptyStateDescription={t('To get started, create a user.')}
        emptyStateButtonText={t('Create user')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaUser)}
        {...view}
        defaultSubtitle={t('User')}
      />
    </PageLayout>
  );
}
