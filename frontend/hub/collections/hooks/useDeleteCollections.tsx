import { compareStrings, usePageNavigate } from '@ansible/ansible-ui-framework';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import {
  collectionKeyFn,
  getRepositoryBasePath,
  hubAPIDelete,
} from '../../common/api/hub-api-utils';
import { isInsightsMode } from '../../common/isInsights';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

export function useDeleteCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void,
  version?: boolean,
  detail?: boolean
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();
  const navigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      let confirmText = version
        ? t('Yes, I confirm that I want to delete these {{count}} collections versions.', {
            count: collections.length,
          })
        : t('Yes, I confirm that I want to delete these {{count}} collections.', {
            count: collections.length,
          });

      confirmText +=
        ' ' +
        t(`Note that if you selected one collection in multiple repositories, it will be
      deleted only once from all repositories.`);

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
            l.collection_version?.name ||
              '' +
                l.repository?.name +
                l.collection_version?.version +
                l.collection_version?.namespace,
            r.collection_version?.name ||
              '' +
                r.repository?.name +
                r.collection_version?.version +
                r.collection_version?.namespace
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch, signal) => {
          return deleteCollection(collection, version, signal, t).then(() => {
            clearCacheByKey(hubAPI`/v3/plugin/ansible/content/`);
            if (detail) {
              void navigate(HubRoute.Collections);
            }
          });
        },
      });
    },
    [
      version,
      t,
      bulkAction,
      confirmationColumns,
      actionColumns,
      onComplete,
      clearCacheByKey,
      detail,
      navigate,
    ]
  );
}

async function deleteCollection(
  collection: CollectionVersionSearch,
  version: boolean | undefined,
  signal: AbortSignal,
  t: TFunction<'translation', undefined>
) {
  let basePath: string;

  if (isInsightsMode()) {
    // In Insights mode, use getRepositoryBasePath which first tries to find a distribution
    // with the same name as the repository (e.g., "published"), avoiding synclist distributions
    // that may be returned first when querying by repository pulp_href alone
    basePath = await getRepositoryBasePath(
      collection?.repository?.name || '',
      collection?.repository?.pulp_href || '',
      t
    );
  } else {
    // In non-Insights mode, use the first distribution for the repository
    const distro: PulpItemsResponse<Distribution> = await requestGet(
      pulpAPI`/distributions/ansible/ansible/?repository=${collection?.repository?.pulp_href}`
    );
    basePath = distro.results[0].base_path;
  }

  let versionQuery = '';
  if (version) {
    versionQuery = 'versions/' + collection.collection_version?.version || '' + '/';
  }
  await hubAPIDelete(
    hubAPI`/v3/plugin/ansible/content/${basePath}/collections/index/${
      collection?.collection_version?.namespace || ''
    }/${collection?.collection_version?.name || ''}/` + versionQuery,
    signal
  );
}

interface Distribution {
  base_path: string;
}
