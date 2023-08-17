import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { collectionKeyFn, pulpAPI, parsePulpIDFromURL } from '../../api';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

export function useDeleteCollectionsFromRepository(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: t('Permanently delete collections from repositories', { count: collections.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} collections.', {
          count: collections.length,
        }),
        actionButtonText: t('Delete collections', { count: collections.length }),
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version.name + l.repository.name,
            r.collection_version.name + l.repository.name
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) =>
          deleteCollectionFromRepository(collection),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deleteCollectionFromRepository(collection: CollectionVersionSearch) {
  return postRequest(
    pulpAPI`/repositories/ansible/ansible/${
      parsePulpIDFromURL(collection.repository.pulp_href) || ''
    }/modify/`,
    {
      remove_content_units: [collection.collection_version.pulp_href],
      base_version: collection.repository.latest_version_href,
    }
  );
}
