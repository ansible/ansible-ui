import { compareStrings } from '@ansible/ansible-ui-framework';
import { requestGet, requestPatch } from '@ansible/common-ui/crud/Data';
import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { collectionKeyFn, getRepositoryBasePath } from '../../common/api/hub-api-utils';
import { isInsightsMode } from '../../common/isInsights';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { PulpItemsResponse } from '../../common/useHubView';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';

export function useDeprecateOrUndeprecateCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();
  return useCallback(
    (collections: CollectionVersionSearch[], type: 'deprecate' | 'undeprecate') => {
      bulkAction({
        title:
          type === 'deprecate'
            ? t('Permanently deprecate collections')
            : t('Permanently undeprecate collections'),

        confirmText:
          type === 'deprecate'
            ? t('Yes, I confirm that I want to deprecate these {{count}} collections.', {
                count: collections.length,
              })
            : t('Yes, I confirm that I want to undeprecate these {{count}} collections.', {
                count: collections.length,
              }),
        actionButtonText:
          type === 'deprecate' ? t('Deprecate collections') : t('Undeprecate collections'),
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
          deprecateOrUndeprecateCollection(collection, type, t),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deprecateOrUndeprecateCollection(
  collection: CollectionVersionSearch,
  type: 'deprecate' | 'undeprecate',
  t: TFunction<'translation', undefined>
) {
  let basePath: string;

  if (isInsightsMode()) {
    // In Insights mode, use getRepositoryBasePath which first tries to find a distribution
    // with the same name as the repository (e.g., "published"), avoiding synclist distributions
    // that may be returned first when querying by repository pulp_href alone
    basePath = await getRepositoryBasePath(
      collection.repository?.name || '',
      collection.repository?.pulp_href || '',
      t
    );
  } else {
    // In non-Insights mode, use the first distribution for the repository
    const distro: PulpItemsResponse<Distribution> = await requestGet(
      pulpAPI`/distributions/ansible/ansible/?repository=${collection.repository?.pulp_href}`
    );
    basePath = distro.results[0].base_path;
  }

  return requestPatch(
    hubAPI`/v3/plugin/ansible/content/${basePath}/collections/index/${
      collection.collection_version?.namespace || ''
    }/${collection.collection_version?.name || ''}/`,
    { deprecated: type === 'deprecate' ? true : false }
  );
}

interface Distribution {
  base_path: string;
}
