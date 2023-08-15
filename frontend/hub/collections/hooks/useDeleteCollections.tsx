import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { collectionKeyFn } from '../../api';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { hubAPI } from '../../api';

export function useDeleteCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: t('Permanently delete collections', { count: collections.length }),
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
          requestDelete(
            hubAPI`/v3/plugin/ansible/content/${collection.repository.name}/collections/index/${collection.collection_version.namespace}/${collection.collection_version.name}/`
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
