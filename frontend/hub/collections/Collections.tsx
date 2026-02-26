import {
  PageTable,
  useGetPageUrl,
  PageLayoutWithUnauthorized,
  PageActionSelection,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../common/api/formatPath';
import { collectionKeyFn } from '../common/api/hub-api-utils';
import { filterInsightsBulkActions, isInsightsMode } from '../common/isInsights';
import { useHubView } from '../common/useHubView';
import { isAccessDeniedError } from '../common/utils/errorUtils';
import { HubRoute } from '../main/HubRoutes';
import { CollectionVersionSearch } from './Collection';
import { useCollectionActions } from './hooks/useCollectionActions';
import { useCollectionColumns } from './hooks/useCollectionColumns';
import { useCollectionFilters } from './hooks/useCollectionFilters';
import { useCollectionsActions } from './hooks/useCollectionsActions';

export function Collections() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
    },
    toolbarFilters,
    defaultSort: 'name',
  });

  const allToolbarActions = useCollectionsActions(view.unselectItemsAndRefresh);
  const rowActions = useCollectionActions(view.unselectItemsAndRefresh);

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
  );

  // In Insights mode, hide the upload button and all bulk actions from the collections list page
  // Upload is only available from the namespace detail page in Insights deployments
  const toolbarActions = useMemo(() => {
    if (isInsightsMode()) {
      return filterInsightsBulkActions(allToolbarActions).filter(
        (action) =>
          !('selection' in action) ||
          action.selection !== PageActionSelection.None ||
          !('label' in action) ||
          action.label !== t('Upload collection')
      );
    }
    return allToolbarActions;
  }, [allToolbarActions, t]);

  const emptyState = isInsightsMode() ? (
    <PageTableEmptyState
      title={t('No collections yet')}
      description={t('To upload a collection, navigate to a namespace you have access to.')}
    />
  ) : (
    <PageTableEmptyState
      title={t('No collections yet')}
      description={t('To get started, upload a collection.')}
    >
      <ButtonLink
        data-cy="upload-collection"
        data-testid="upload-collection"
        icon={<PlusCircleIcon />}
        variant={ButtonVariant.primary}
        href={getPageUrl(HubRoute.UploadCollection)}
      >
        {t('Upload collection')}
      </ButtonLink>
    </PageTableEmptyState>
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Collections')}
      title={t('Collections')}
      description={description}
      titleHelpTitle={t('Collections')}
      titleHelp={description}
      titleDocLink="https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/developing_automation_content/devtools-develop-collections_develop-automation-content"
    >
      <PageTable<CollectionVersionSearch>
        id="hub-collection-version-search-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading collections')}
        emptyState={emptyState}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
        {...view}
      />
    </PageLayoutWithUnauthorized>
  );
}
