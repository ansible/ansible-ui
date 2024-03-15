import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { hubAPI } from '../../common/api/formatPath';
import { useHubView } from '../../common/useHubView';
import { HubUser } from '../../interfaces/expanded/HubUser';
import { useUserColumns } from './hooks/useUserColumns';
import { useUserFilters } from './hooks/useUserFilters';
import { idKeyFn } from '../../../common/utils/nameKeyFn';

export function Users() {
  const { t } = useTranslation();
  const tableColumns = useUserColumns();
  const toolbarFilters = useUserFilters();

  const view = useHubView<HubUser>({
    url: hubAPI`/_ui/v1/users/`, // ?sort=username&offset=0&limit=10
    keyFn: idKeyFn,
    tableColumns,
    toolbarFilters,
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('Users')}
        description={t(
          'A user is someone who has access to Hub with associated permissions and credentials.'
        )}
      />
      <PageTable
        id="hub-users-table"
        tableColumns={tableColumns}
        toolbarActions={[]}
        rowActions={[]}
        errorStateTitle={t('Error loading users')}
        emptyStateTitle={t('There are currently no users created for your organization.')}
        emptyStateDescription={t('Please create a user by using the button below.')}
        {...view}
        defaultSubtitle={t('User')}
      />
    </PageLayout>
  );
}
