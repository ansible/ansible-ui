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
import { Button } from '@patternfly/react-core';
import { deleteCollectionFromRepository } from '../../../collections/hooks/useDeleteCollectionsFromRepository';
import { Repository } from '../Repository';
import { useMemo } from 'react';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useCallback } from 'react';
import { ITableColumn } from '../../../../../framework';
import { useAddCollections } from '../hooks/useAddCollections';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function RepositoryCollectionVersion() {
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

  const runAddModal = useAddCollections(repository, () => {
    view.unselectItemsAndRefresh([]);
    setSelectedCollections([]);
  });

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
          <Button onClick={() => runAddModal()}>{t('Add collections')}</Button>
        </>
      }
      rowActions={rowActions}
      errorStateTitle={t('Error loading collection versions')}
      emptyStateTitle={t('No collection versions yet')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Add collections')}
      emptyStateButtonClick={() => runAddModal()}
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

export function collectionId(collection: CollectionVersionSearch) {
  return (
    collection.collection_version?.namespace +
    '_' +
    collection?.collection_version?.name +
    '_' +
    collection?.collection_version?.version +
    '_' +
    collection.repository?.name
  );
}

type BulkCollection = CollectionVersionSearch[];

export function useModifyCollections(
  onComplete: (collections: BulkCollection[]) => void,
  operation: 'add' | 'remove'
) {
  const { t } = useTranslation();
  const confirmationColumns = useBulkCollectionColumns(operation);
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<BulkCollection>();

  return useCallback(
    (bulkCollections: BulkCollection[], onClick: () => Promise<unknown>) => {
      const confirmText =
        operation === 'add'
          ? t('Yes, I confirm that I want to add these {{count}} collections versions.', {
              count: bulkCollections[0].length,
            })
          : t('Yes, I confirm that I want to remove these {{count}} collections versions.', {
              count: bulkCollections[0].length,
            });

      const title =
        operation === 'add' ? t('Add collections versions') : t('Remove collections versions');

      const actionButtonText =
        operation === 'add' ? t('Add collections versions') : t('Remove collections versions');

      bulkAction({
        title,
        confirmText,
        actionButtonText,
        items: bulkCollections,
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: () => {
          return onClick();
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, operation]
  );
}

export function useBulkCollectionColumns(operation: 'add' | 'remove') {
  const { t } = useTranslation();

  return useMemo<ITableColumn<BulkCollection>[]>(
    () => [
      {
        header: t('Description'),
        type: 'description',
        value: (bulkCollection) =>
          operation === 'add'
            ? t('All {{count}} collections will be added in single operation to server.', {
                count: bulkCollection.length,
              })
            : t('All {{count}} collections will be removed in single operation to server.', {
                count: bulkCollection.length,
              }),
      },
    ],
    [t, operation]
  );
}
