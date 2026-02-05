import {
  PageTable,
  useGetPageUrl,
  PageLayoutWithUnauthorized,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { pulpAPI } from '../../common/api/formatPath';
import { pulpHrefKeyFn } from '../../common/api/hub-api-utils';
import { useHubConfig } from '../../common/useHubConfig';
import { useHubView } from '../../common/useHubView';
import { isAccessDeniedError } from '../../common/utils/errorUtils';
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
  const config = useHubConfig();
  const docsUrl = useGetDocsUrl(config, 'repositories');

  const view = useHubView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: pulpHrefKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useRepositoryToolbarActions(view);
  const rowActions = useRepositoryActions({ onRepositoriesDeleted: view.unselectItemsAndRefresh });

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Repositories are online storage locations where Ansible content, such as roles and collections, can be published, shared, and accessed by the community.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Repositories')}
      title={t('Repositories')}
      titleHelpTitle={t('Repositories')}
      titleHelp={description}
      description={description}
      titleDocLink={docsUrl}
    >
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
    </PageLayoutWithUnauthorized>
  );
}
