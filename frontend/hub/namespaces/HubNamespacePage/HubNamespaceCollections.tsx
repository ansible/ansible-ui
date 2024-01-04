import { useTranslation } from 'react-i18next';
import { PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { collectionKeyFn } from '../../api/utils';
import { hubAPI } from '../../api/formatPath';
import { useHubView } from '../../useHubView';
import { useCollectionColumns } from '../../collections/hooks/useCollectionColumns';
import { useCollectionFilters } from '../../collections/hooks/useCollectionFilters';
import { CollectionVersionSearch } from '../../collections/Collection';
import { useCollectionActions } from '../../collections/hooks/useCollectionActions';
import { useCollectionsActions } from '../../collections/hooks/useCollectionsActions';
import { useParams } from 'react-router-dom';

export function HubNamespaceCollections() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    sortKey: 'order_by',
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
      namespace: params?.id || '',
    },
    toolbarFilters,
  });

  const toolbarActions = useCollectionsActions(view.unselectItemsAndRefresh);
  const rowActions = useCollectionActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageTable<CollectionVersionSearch>
        id="hub-collection-version-search-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        emptyStateDescription={t('To get started, upload a collection.')}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  );
}
