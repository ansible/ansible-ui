import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../common/Routes';
import { collectionKeyFn, hubAPI } from '../api/utils';
import { useHubView } from '../useHubView';
import { CollectionVersionSearch } from './Collection';
import { useCollectionActions } from './hooks/useCollectionActions';
import { useCollectionColumns } from './hooks/useCollectionColumns';
import { useCollectionFilters } from './hooks/useCollectionFilters';
import { useCollectionsActions } from './hooks/useCollectionsActions';

export function Collections() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useCollectionFilters();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions`,
    keyFn: collectionKeyFn,
    sortKey: 'order_by',
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
    },
    toolbarFilters,
  });

  const toolbarActions = useCollectionsActions(view.unselectItemsAndRefresh);
  const rowActions = useCollectionActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Collections')}
        description={t(
          'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
        )}
        titleHelpTitle={t('Collection')}
        titleHelp={t(
          'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
        )}
        titleDocLink="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html"
      />

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
        emptyStateButtonClick={() => navigate(RouteObj.UploadCollection)}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
      />
    </PageLayout>
  );
}
