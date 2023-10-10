import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete, requestGet } from '../../../common/crud/Data';
import { collectionKeyFn, hubAPI, pulpAPI } from '../../api/utils';
import { PulpItemsResponse } from '../../usePulpView';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { usePageNavigate } from '../../../../framework';
import { navigateAfterDelete } from './useDeleteCollectionsFromRepository';

export function useDeleteCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void,
  version?: boolean,
  detail?: boolean
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();
  const navigate = usePageNavigate();

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      const confirmText = version
        ? t('Yes, I confirm that I want to delete these {{count}} collections versions.', {
            count: collections.length,
          })
        : t('Yes, I confirm that I want to delete these {{count}} collections.', {
            count: collections.length,
          });

      const title = version
        ? t('Permanently delete collections versions', { count: collections.length })
        : t('Permanently delete collections', { count: collections.length });

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
        actionFn: (collection: CollectionVersionSearch) => {
          return deleteCollection(collection, version).then(() => {
            if (detail) {
              return navigateAfterDelete(collection, version || false, navigate);
            }
          });
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, version, detail, navigate]
  );
}

async function deleteCollection(collection: CollectionVersionSearch, version?: boolean) {
  const distro: PulpItemsResponse<Distribution> = await requestGet(
    pulpAPI`/distributions/ansible/ansible/?repository=${collection?.repository?.pulp_href || ''}`
  );

  let versionQuery = '';
  if (version) {
    versionQuery = 'versions/' + collection.collection_version?.version || '' + '/';
  }
  await requestDelete(
    hubAPI`/v3/plugin/ansible/content/${distro.results[0].base_path}/collections/index/${
      collection?.collection_version?.namespace || ''
    }/${collection?.collection_version?.name || ''}/` + versionQuery
  );
}

interface Distribution {
  base_path: string;
}
