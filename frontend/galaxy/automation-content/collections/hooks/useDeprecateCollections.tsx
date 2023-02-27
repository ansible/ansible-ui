import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../Data';
import { idKeyFn } from '../../../useGalaxyView';
import { Collection } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

export function useDeleteCollections(onComplete?: (collections: Collection[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<Collection>();
  return useCallback(
    (collections: Collection[]) => {
      bulkAction({
        title: t('Permanently delete collections', { count: collections.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} collections.', {
          count: collections.length,
        }),
        actionButtonText: t('Delete collections', { count: collections.length }),
        items: collections.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: Collection) =>
          requestDelete(
            `/api/automation-hub/v3/plugin/ansible/content/published/collections/index/${collection.namespace.name}/${collection.name}/`
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
