import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PageTable } from '../../../../../framework';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { useCollectionColumns } from '../../../collections/hooks/useCollectionColumns';
import { hubAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';
import { useHubView } from '../../../common/useHubView';
import { useCollectionVersionsActionsRemove } from '../hooks/useRepositoryActions';
import { useRepositoryCollectionVersionFiltersRemove } from '../hooks/useRepositorySelector';
import { useState } from 'react';
import { collectionId, useModifyCollections } from './RepositoryAddCollectionVersion';
import { Button } from '@patternfly/react-core';
import { deleteCollectionFromRepository } from '../../../collections/hooks/useDeleteCollectionsFromRepository';
import { Repository } from '../Repository';

export function RepositoryRemoveCollectionVersion() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryCollectionVersionFiltersRemove();
  const { repo_id, repository } = useOutletContext<{
    id: string;
    repo_id: string;
    repository: Repository;
  }>();
  const tableColumns = useCollectionColumns();

  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions/`,
    keyFn: collectionKeyFn,
    defaultSort: 'name',
    queryParams: {
      is_deprecated: 'false',
      repository: repo_id,
    },
    toolbarFilters,
  });

  const rowActions = useCollectionVersionsActionsRemove(repository, view.unselectItemsAndRefresh);
  const [selectedCollections, setSelectedCollections] = useState<CollectionVersionSearch[]>([]);

  const dialog = useModifyCollections(() => {
    view.unselectItemsAndRefresh(selectedCollections);
    setSelectedCollections([]);
  }, 'remove');

  return (
    <PageTable<CollectionVersionSearch>
      id="hub-collection-versions-search-table"
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      toolbarContent={
        <>
        <Button
          onClick={() =>
            dialog([selectedCollections], () =>
              deleteCollectionFromRepository(repository, selectedCollections, true)
            )
          }
          isDisabled={selectedCollections.length === 0}
        >
          {t('Remove collections')}
        </Button>
        &nbsp;&nbsp;
        <Button>
        {t('Add collections')}
        </Button>
        </>
      }
      rowActions={rowActions}
      errorStateTitle={t('Error loading collection versions')}
      emptyStateTitle={t('No collection versions yet')}
      emptyStateDescription={t('Collection versions will appear once the repository is modified.')}
      {...view}
      defaultTableView="list"
      defaultSubtitle={t('Collection')}
      compact={true}
      showSelect={true}
      selectedItems={selectedCollections}
      isSelectMultiple={true}
      isSelected={(item) =>
        selectedCollections.find((i) => collectionId(i) === collectionId(item)) ? true : false
      }
      selectItem={(item) => {
        const newItems = [...selectedCollections, item];
        setSelectedCollections(newItems);
      }}
      selectItems={(items) => {
        const newItems = [...selectedCollections, ...items];
        setSelectedCollections(newItems);
      }}
      unselectItem={(item) => {
        setSelectedCollections(
          selectedCollections.filter((item2) => collectionId(item2) !== collectionId(item))
        );
      }}
      unselectAll={() => {
        setSelectedCollections([]);
      }}
    />
  );
}
