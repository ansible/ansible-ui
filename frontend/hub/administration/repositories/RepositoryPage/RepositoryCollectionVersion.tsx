import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PageTable } from '../../../../../framework';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { useCollectionColumns } from '../../../collections/hooks/useCollectionColumns';
import { hubAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';
import { useHubView } from '../../../common/useHubView';
import { useCollectionVersionsActions } from '../hooks/useRepositoryActions';
import { useRepositoryCollectionVersionFilters } from '../hooks/useRepositorySelector';
import { useRepositoryCollectionVersionToolbarActions } from '../hooks/useRepositoryToolbarActions';

export function RepositoryCollectionVersion() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryCollectionVersionFilters();
  const rowActions = useCollectionVersionsActions();
  const toolbarActions = useRepositoryCollectionVersionToolbarActions();
  const { repo_id } = useOutletContext<{ id: string; repo_id: string }>();
  const tableColumns = useCollectionColumns();
  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    defaultSort: 'name',
    queryParams: {
      is_deprecated: 'false',
      repository_label: '!hide_from_search',
      is_highest: 'true',
      repository: repo_id,
    },
    toolbarFilters,
  });

  return (
    <PageTable<CollectionVersionSearch>
      id="hub-collection-versions-search-table"
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading collection versions')}
      emptyStateTitle={t('No collection versions yet')}
      emptyStateDescription={t('Collection versions will appear once the collection is modified.')}
      emptyStateButtonText={t('Add collection')}
      emptyStateButtonClick={() => {}}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Collection')}
    />
  );
}
