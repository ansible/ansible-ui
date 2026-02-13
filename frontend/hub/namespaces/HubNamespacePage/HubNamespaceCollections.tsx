import {
  PageActionSelection,
  PageLayout,
  PageTable,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CollectionVersionSearch } from '../../collections/Collection';
import { useCollectionActions } from '../../collections/hooks/useCollectionActions';
import { useCollectionColumns } from '../../collections/hooks/useCollectionColumns';
import { useCollectionFilters } from '../../collections/hooks/useCollectionFilters';
import { useCollectionsActions } from '../../collections/hooks/useCollectionsActions';
import { hubAPI } from '../../common/api/formatPath';
import { collectionKeyFn } from '../../common/api/hub-api-utils';
import { isInsightsMode } from '../../common/isInsights';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';

export function HubNamespaceCollections() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    queryParams: {
      repository_label: '!hide_from_search',
      is_highest: 'true',
      namespace: params?.id || '',
    },
    toolbarFilters,
  });

  // In Insights mode, check if user has access to this namespace via my-namespaces API
  // If the namespace is not in my-namespaces (404), the user cannot upload to it
  // Skip this API call in Platform mode since it's not needed there
  const { data: myNamespace } = useGet<HubNamespace>(
    isInsightsMode() && params?.id ? hubAPI`/_ui/v1/my-namespaces/${params.id}/` : ''
  );
  const showControls = !!myNamespace;

  const allToolbarActions = useCollectionsActions(view.unselectItemsAndRefresh, params?.id);

  // In Insights mode, filter out upload button if user doesn't have access to this namespace
  const toolbarActions = useMemo(() => {
    if (isInsightsMode() && !showControls) {
      return allToolbarActions.filter(
        (action) =>
          !('selection' in action) ||
          action.selection !== PageActionSelection.None ||
          !('label' in action) ||
          action.label !== t('Upload collection')
      );
    }
    return allToolbarActions;
  }, [allToolbarActions, showControls, t]);

  const rowActions = useCollectionActions(view.unselectItemsAndRefresh);

  // In Insights mode, only show upload button in empty state if user has access
  // In Platform mode, always show the upload button
  const canShowUploadButton = !isInsightsMode() || showControls;
  const emptyState = canShowUploadButton ? (
    <PageTableEmptyState
      title={t('No collections yet')}
      description={t('To get started, upload a collection.')}
    >
      <ButtonLink
        icon={<PlusCircleIcon />}
        variant={ButtonVariant.primary}
        href={getPageUrl(
          HubRoute.UploadCollection,
          params?.id ? { query: { namespace: params.id } } : undefined
        )}
      >
        {t('Upload collection')}
      </ButtonLink>
    </PageTableEmptyState>
  ) : (
    <PageTableEmptyState
      title={t('No collections yet')}
      description={t('Collections will appear once uploaded.')}
    />
  );

  return (
    <PageLayout>
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
    </PageLayout>
  );
}
