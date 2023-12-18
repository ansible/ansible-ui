import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { collectionKeyFn, hubAPIPost } from '../../api/utils';
import { hubAPI } from '../../api/formatPath';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { useHubContext } from '../../useHubContext';
import { getRepositoryBasePath } from '../../api/utils';

export function useSignVersion(onComplete?: (collections: CollectionVersionSearch[]) => void) {
  const context = useHubContext();
  const signing_service = context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: t('Sign collection version', { count: collections.length }),
        confirmText: t('Yes, I confirm that I want to sign these {{count}} collections versions.', {
          count: collections.length,
        }),
        actionButtonText: t('Sign collections versions', { count: collections.length }),
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
        actionFn: (collection: CollectionVersionSearch) =>
          signCollectionVersion(collection, signing_service),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, signing_service]
  );
}

async function signCollectionVersion(collection: CollectionVersionSearch, signing_service: string) {
  const distro_base_path = await getRepositoryBasePath(
    collection.repository?.name || '',
    collection?.repository?.pulp_href
  );
  return hubAPIPost(hubAPI`/_ui/v1/collection_signing/`, {
    distro_base_path,
    collection: collection.collection_version?.name,
    namespace: collection.collection_version?.namespace,
    signing_service,
    version: collection.collection_version?.version,
  });
}
