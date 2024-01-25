import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PageTable } from '../../../../../framework';
import { CollectionVersionSearch } from '../../../collections/Collection';
import { useCollectionColumns } from '../../../collections/hooks/useCollectionColumns';
import { hubAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';
import { useHubView } from '../../../common/useHubView';
import { useRepositoryCollectionVersionFiltersAdd } from '../hooks/useRepositorySelector';
import { useState } from 'react';
import { Repository } from '../Repository';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { postRequest } from '../../../../common/crud/Data';
import { pulpAPI } from '../../../common/api/formatPath';
import { waitForTask } from '../../../common/api/hub-api-utils';
import { Button } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { useCallback } from 'react';
import { ITableColumn } from '../../../../../framework';
import { PulpItemsResponse } from '../../../common/useHubView';
import { requestGet } from '../../../../common/crud/Data';

export function RepositoryAddCollectionVersion() {
  const { t } = useTranslation();
  const toolbarFilters = useRepositoryCollectionVersionFiltersAdd();
  const { repository } = useOutletContext<{
    id: string;
    repo_id: string;
    repository: Repository;
  }>();
  const tableColumns = useCollectionColumns();
  const [selectedCollections, setSelectedCollections] = useState<CollectionVersionSearch[]>([]);

  const view = useHubView<CollectionVersionSearch>({
    url: hubAPI`/v3/plugin/ansible/search/collection-versions`,
    keyFn: collectionKeyFn,
    defaultSort: 'name',
    queryParams: {
      is_deprecated: 'false',
    },
    toolbarFilters,
  });

  const dialog = useModifyCollections(() => {
    view.unselectItemsAndRefresh(selectedCollections);
    setSelectedCollections([]);
    setSelectedCollections([]);
  }, 'add');

  async function addCollectionsToRepository(collections: CollectionVersionSearch[]) {
    // load the repository again, because we need the latest version as much actual as possible
    // the one received from the page can be very obsolete, because when someones modify repo in meantime user clicks this action, it will fail
    const actualRepositoryResults = await requestGet<PulpItemsResponse<Repository>>(
      pulpAPI`/repositories/ansible/ansible/?name=${repository.name}`
    );
    const actualRepository = actualRepositoryResults.results[0];

    let itemsToDAdd: string[] = collections
      .filter((col) => col.collection_version?.pulp_href)
      .map((coll) => coll.collection_version?.pulp_href || '');

    // get unique items
    itemsToDAdd = [...new Set(itemsToDAdd)];

    const res: { task: string } = await postRequest(
      pulpAPI`/repositories/ansible/ansible/${
        parsePulpIDFromURL(actualRepository.pulp_href) || ''
      }/modify/`,
      {
        add_content_units: itemsToDAdd,
        base_version: actualRepository.latest_version_href,
      }
    );
    await waitForTask(parsePulpIDFromURL(res.task));
  }

  return (
    <>
      <PageTable<CollectionVersionSearch>
        id="hub-collection-versions-search-table"
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        toolbarContent={
          <Button
            onClick={() =>
              dialog([selectedCollections], () => addCollectionsToRepository(selectedCollections))
            }
            isDisabled={selectedCollections.length === 0}
          >
            {t('Add collections')}
          </Button>
        }
        errorStateTitle={t('Error loading collection versions')}
        emptyStateTitle={t('No collection versions yet')}
        emptyStateDescription={t(
          'Collection versions will appear once the collection is modified.'
        )}
        emptyStateButtonText={t('Add collection')}
        emptyStateButtonClick={() => {}}
        {...view}
        defaultTableView="list"
        defaultSubtitle={t('Collection')}
        showSelect={true}
        compact={true}
        selectedItems={selectedCollections}
        isSelectMultiple={true}
        isSelected={(item) =>
          selectedCollections.find((i) => collectionId(i) === collectionId(item)) ||
          item.repository?.name === repository?.name
            ? true
            : false
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
    </>
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
  const confirmationColumns = useBulkCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<BulkCollection>();

  return useCallback(
    (bulkCollections: BulkCollection[], onClick: () => Promise<unknown>) => {
      const confirmText =
        operation === 'add'
          ? t('Yes, I confirm that I want to add these {{count}} collections versions.', {
              count: bulkCollections[0].length,
            })
          : t('Yes, I confirm that I want to add these {{count}} collections versions.', {
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

export function useBulkCollectionColumns() {
  const { t } = useTranslation();

  return useMemo<ITableColumn<BulkCollection>[]>(
    () => [
      {
        header: t('Description'),
        type: 'description',
        value: (bulkCollection) =>
          t('All {{count}} collections will be added in one post request to server.', {
            count: bulkCollection.length,
          }),
      },
    ],
    [t]
  );
}
