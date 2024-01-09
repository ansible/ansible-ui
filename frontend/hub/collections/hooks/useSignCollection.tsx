import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { collectionKeyFn, hubAPIPost } from '../../api/utils';
import { hubAPI } from '../../api/formatPath';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { useHubContext } from '../../useHubContext';
import { getRepositoryBasePath } from '../../api/utils';

export function useSignCollection(
  version: boolean,
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const context = useHubContext();
  const signing_service = context.settings.GALAXY_COLLECTION_SIGNING_SERVICE;
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      const title = version
        ? t('Sign collection version', { count: collections.length })
        : t('Sign collection', { count: collections.length });

      const confirmText = version
        ? t('Yes, I confirm that I want to sign these {{count}} collections versions.', {
            count: collections.length,
          })
        : t('Yes, I confirm that I want to sign these {{count}} collections.', {
            count: collections.length,
          });

      const actionButtonText = version
        ? t('Sign collections versions', { count: collections.length })
        : t('Sign collections', { count: collections.length });

      bulkAction({
        title,
        confirmText,
        actionButtonText,
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version?.name ||
              '' + l.repository?.name + l.collection_version?.namespace + version
              ? l.collection_version?.version
              : '',
            r.collection_version?.name ||
              '' + r.repository?.name + r.collection_version?.namespace + version
              ? r.collection_version?.version
              : ''
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) =>
          signCollectionVersion(version, collection, signing_service),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, signing_service]
  );
}

async function signCollectionVersion(
  version: boolean,
  collection: CollectionVersionSearch,
  signing_service: string
) {
  const distro_base_path = await getRepositoryBasePath(
    collection.repository?.name || '',
    collection?.repository?.pulp_href
  );

  const postData: Record<string, unknown> = {
    distro_base_path,
    collection: collection.collection_version?.name,
    namespace: collection.collection_version?.namespace,
    signing_service,
  };

  if (version) {
    postData.version = collection.collection_version?.version;
  }

  return hubAPIPost(hubAPI`/_ui/v1/collection_signing/`, postData);
}
