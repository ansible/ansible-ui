import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { compareStrings } from '../../../../framework';
import { collectionKeyFn, parsePulpIDFromURL, waitForTask } from '../../api/utils';
import { hubAPI, pulpAPI } from '../../api/formatPath';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { HubItemsResponse } from '../../useHubView';
import { usePageNavigate } from '../../../../framework';
import { HubRoute } from '../../HubRoutes';
import { postRequest } from '../../../common/crud/Data';
import { getHubAllItems } from '../../api/request';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';

export function useDeleteCollectionsFromRepository(
  onComplete?: (collections: CollectionVersionSearch[]) => void,
  version?: boolean,
  detail?: boolean
) {
  const { t } = useTranslation();
  const confirmationColumns = useCollectionColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();
  const navigate = usePageNavigate();

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      const title = version
        ? t('Permanently delete collections versions from repository', {
            count: collections.length,
          })
        : t('Permanently delete collections from repository', { count: collections.length });

      const confirmText = version
        ? t(
            'Yes, I confirm that I want to delete these {{count}} collections versions from repository.',
            {
              count: collections.length,
            }
          )
        : t('Yes, I confirm that I want to delete these {{count}} collections from repository.', {
            count: collections.length,
          });

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
          return deleteCollectionFromRepository(collection, version, t).then(() => {
            if (detail) {
              return navigateAfterDelete(collection, version || false, navigate);
            }
          });
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, version, navigate, detail]
  );
}

async function deleteCollectionFromRepository(
  collection: CollectionVersionSearch,
  version?: boolean,
  t?: TFunction<'translation', undefined>
) {
  let itemsToDelete: string[] = [];

  if (!collection.repository) {
    throw new Error(t?.('Collection is missing in the repositories'));
  }

  let loadedAll = true;

  if (!version) {
    // load all associated collection versions
    // TODO - waiting for API
    const url = hubAPI`/v3/plugin/ansible/search/collection-versions/?limit=100&name=${
      collection.collection_version?.name || ''
    }&repository_name=${collection.repository.name}`;

    const result = await getHubAllItems<
      HubItemsResponse<CollectionVersionSearch>,
      CollectionVersionSearch
    >(url, {
      getData: (data) => data.data,
      getNextUrl: (data) => data.links.next,
    });

    loadedAll = result.loadedAll;
    itemsToDelete = result.results?.map((item) => item.collection_version?.pulp_href || '');
  } else {
    itemsToDelete.push(collection.collection_version?.pulp_href || '');
  }

  const res: { task: string } = await postRequest(
    pulpAPI`/repositories/ansible/ansible/${
      parsePulpIDFromURL(collection.repository.pulp_href) || ''
    }/modify/`,
    {
      remove_content_units: itemsToDelete,
      base_version: collection.repository.latest_version_href,
    }
  );
  await waitForTask(parsePulpIDFromURL(res.task));

  if (!loadedAll) {
    throw new Error(
      t?.(
        'Not all collections versions were removed. This operation can remove only 300 versions. Try to repeat this operation.'
      )
    );
  }
}

export function navigateAfterDelete(
  collection: CollectionVersionSearch,
  version: boolean,
  navigate: ReturnType<typeof usePageNavigate>
) {
  if (version) {
    navigate(HubRoute.CollectionPage, {
      query: {
        repository: collection.repository?.name || '',
        name: collection.collection_version?.name || '',
        namespace: collection.collection_version?.namespace || '',
        redirectIfEmpty: 'true',
      },
    });
  } else {
    navigate(HubRoute.Collections);
  }
}
