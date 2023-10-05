import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete, requestGet } from '../../../common/crud/Data';
import { collectionKeyFn, hubAPI, pulpAPI } from '../../api/utils';
import { PulpItemsResponse } from '../../usePulpView';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

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
            l.collection_version?.name || '' + l.repository?.name,
            r.collection_version?.name || '' + r.repository?.name
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) => deleteCollection(collection),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deleteCollection(collection: CollectionVersionSearch) {
  const distro: PulpItemsResponse<Distribution> = await requestGet(
    pulpAPI`/distributions/ansible/ansible/?repository=${collection?.repository?.pulp_href || ''}`
  );
  return requestDelete(
    hubAPI`/v3/plugin/ansible/content/${distro.results[0].base_path}/collections/index/${
      collection?.collection_version?.namespace || ''
    }/${collection?.collection_version?.name || ''}/`
  );
}

interface Distribution {
  base_path: string;
}
