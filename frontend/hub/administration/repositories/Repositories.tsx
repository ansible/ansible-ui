import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { Repository } from './Repository';
import { useRepositoriesColumns } from './hooks/useRepositoriesColumns';
import { useRepositoryActions } from './hooks/useRepositoryActions';
import { useRepositoryFilters } from './hooks/useRepositorySelector';
import { useRepositoryToolbarActions } from './hooks/useRepositoryToolbarActions';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Icon } from '@patternfly/react-core';

export function Repositories() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoriesColumns();
  const pageNavigate = usePageNavigate();

  const view = useHubView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useRepositoryToolbarActions(view);
  const rowActions = useRepositoryActions({ onRepositoriesDeleted: view.unselectItemsAndRefresh });

  return (
    <PageLayout>
      <PageHeader
        title={t('Repositories')}
        description={t(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )}
      />
      <PageTable<Repository>
        id="hub-repositories-table"
        defaultSubtitle={t('Repository')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.CreateRepository)}
        emptyStateButtonText={t('Create repository')}
        emptyStateButtonIcon={
          <Icon>
            <PlusCircleIcon />
          </Icon>
        }
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
