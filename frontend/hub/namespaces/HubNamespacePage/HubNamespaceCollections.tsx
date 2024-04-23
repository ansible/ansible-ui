import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { CollectionVersionSearch } from '../../collections/Collection';
import { useCollectionActions } from '../../collections/hooks/useCollectionActions';
import { useCollectionColumns } from '../../collections/hooks/useCollectionColumns';
import { useCollectionFilters } from '../../collections/hooks/useCollectionFilters';
import { useCollectionsActions } from '../../collections/hooks/useCollectionsActions';
import { hubAPI } from '../../common/api/formatPath';
import { collectionKeyFn } from '../../common/api/hub-api-utils';
import { useHubView } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function HubNamespaceCollections() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
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
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Upload collection')}
        emptyStateButtonClick={() => pageNavigate(HubRoute.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  );
}
