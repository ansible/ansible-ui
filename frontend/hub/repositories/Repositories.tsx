import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { HubRoute } from '../HubRoutes';
import { pulpAPI } from '../api/formatPath';
import { pulpHrefKeyFn } from '../api/utils';
import { useHubView } from '../useHubView';
import { Repository } from './Repository';
import { useRepositoryToolbarActions } from './hooks/useRepositoryToolbarActions';
import { useRepositoryFilters } from './hooks/useRepositorySelector';
import { useRepositoryActions } from './hooks/useRepositoryActions';
import { useRepositoriesColumns } from './hooks/useRepositoriesColumns';

export function Repositories() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoriesColumns();
  const toolbarActions = useRepositoryToolbarActions();
  const rowActions = useRepositoryActions();
  const pageNavigate = usePageNavigate();

  const view = useHubView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('Repository Management')}
        description={t(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )}
      />
      <PageTable<Repository>
        id="hub-repositories-table"
        defaultSubtitle={t('Repository')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.CreateRepository)}
        emptyStateButtonText={t('Create repository')}
        emptyStateTitle={t('No repositories yet')}
        errorStateTitle={t('Error loading repositories')}
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayout>
  );
}
