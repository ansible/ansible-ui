import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { Repository } from './Repository';
import { useRepositoriesColumns } from './hooks/useRepositoriesColumns';
import { useRepositoryActions } from './hooks/useRepositoryActions';
import { useRepositoryFilters } from './hooks/useRepositorySelector';
import { useRepositoryToolbarActions } from './hooks/useRepositoryToolbarActions';

export function Repositories() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryFilters();
  const tableColumns = useRepositoriesColumns();
  const getPageUrl = useGetPageUrl();

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
        titleHelpTitle={t('Repositories')}
        titleHelp={t(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )}
        description={t(
          'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
        )}
      />
      <PageTable<Repository>
        id="hub-repositories-table"
        defaultSubtitle={t('Repository')}
        errorStateTitle={t('Error loading repositories')}
        emptyState={
          <PageTableEmptyState
            title={t('No repositories yet')}
            description={t('You can create a repository to store and share Ansible content.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(HubRoute.CreateRepository)}
            >
              {t('Create repository')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        rowActions={rowActions}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        {...view}
      />
    </PageLayout>
  );
}
