import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { postRequest, requestGet } from '../../../common/crud/Data';
import { collectionKeyFn, parsePulpIDFromURL, pulpAPI } from '../../api/utils';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { hubAPI } from '../../api/utils';
import { HubItemsResponse } from '../../useHubView';

export function useDeleteCollectionsFromRepository(
  onComplete?: (collections: CollectionVersionSearch[]) => void,
  version?: boolean
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      const title = version
        ? t('Permanently delete collections versions from repository', {
            count: collections.length,
          })
        : t('Permanently delete collections from repository', { count: collections.length });

      const confirmText = version
        ? t(
            'Yes, I confirm that I want to delete these {{count}} collections versions from repository.',
            {
              count: collections.length,
            }
          )
        : t('Yes, I confirm that I want to delete these {{count}} collections from repository.', {
            count: collections.length,
          });

      const actionButtonText = version
        ? t('Delete collections versions', { count: collections.length })
        : t('Delete collections', { count: collections.length });

      bulkAction({
        title,
        confirmText,
        actionButtonText,
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version?.name || '' + l.repository?.name + l.collection_version?.version,
            r.collection_version?.name || '' + r.repository?.name + r.collection_version?.version
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) =>
          deleteCollectionFromRepository(collection, version),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, version]
  );
}

async function deleteCollectionFromRepository(
  collection: CollectionVersionSearch,
  version?: boolean
) {
  let itemsToDelete: string[] = [];

  if (!version) {
    // load all associated collection versions
    const results = await requestGet<HubItemsResponse<CollectionVersionSearch>>(
      hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${
        collection.collection_version?.name || ''
      }&repository_name=${collection.repository?.name || ''}`
    );
    itemsToDelete = results.data?.map((item) => item.collection_version?.pulp_href || '');
  } else {
    itemsToDelete.push(collection.collection_version?.pulp_href || '');
  }

  return postRequest(
    pulpAPI`/repositories/ansible/ansible/${
      parsePulpIDFromURL(collection.repository?.pulp_href || '') || ''
    }/modify/`,
    {
      remove_content_units: itemsToDelete,
      base_version: collection.repository?.latest_version_href || '',
    }
  );
}
