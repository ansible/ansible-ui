import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { requestGet, requestPatch } from '../../../common/crud/Data';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { collectionKeyFn } from '../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { PulpItemsResponse } from '../../common/useHubView';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

export function useDeprecateCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: t('Permanently deprecate collections', { count: collections.length }),
        confirmText: t('Yes, I confirm that I want to deprecate these {{count}} collections.', {
          count: collections.length,
        }),
        actionButtonText: t('Deprecate collections', { count: collections.length }),
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version?.name || '' + l.repository?.name + l.collection_version?.namespace,
            r.collection_version?.name || '' + r.repository?.name + r.collection_version?.namespace
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) => deprecateCollection(collection),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deprecateCollection(collection: CollectionVersionSearch) {
  const distro: PulpItemsResponse<Distribution> = await requestGet(
    pulpAPI`/distributions/ansible/ansible/?repository=${collection.repository?.pulp_href}`
  );
  return requestPatch(
    hubAPI`/v3/plugin/ansible/content/${distro.results[0].base_path}/collections/index/${
      collection.collection_version?.namespace || ''
    }/${collection.collection_version?.name || ''}/`,
    { deprecated: true }
  );
}

interface Distribution {
  base_path: string;
}
