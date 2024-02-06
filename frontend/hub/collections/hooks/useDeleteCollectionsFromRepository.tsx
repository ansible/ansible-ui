import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, usePageNavigate } from '../../../../framework';
import { postRequest } from '../../../common/crud/Data';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { collectionKeyFn, parsePulpIDFromURL, waitForTask } from '../../common/api/hub-api-utils';
import { getHubAllItems } from '../../common/api/request';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from './useCollectionColumns';
import { Repository } from '../../administration/repositories/Repository';
import { requestGet } from '../../../common/crud/Data';
import { PulpItemsResponse } from '../../common/useHubView';

export function useDeleteCollectionsFromRepository(
  // if repository is undefined, it will be taken from collection.repository
  // but then it will not allow for batch operation over one repo for multiple collections
  repository?: Repository,
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
        actionFn: (collection: CollectionVersionSearch) => {
          const newRepository = repository ? repository : ({} as Repository);
          if (!repository) {
            newRepository.name = collection.repository?.name || '';
            newRepository.latest_version_href = collection.repository?.latest_version_href || '';
            newRepository.pulp_href = collection.repository?.pulp_href || '';
          }

          return deleteCollectionFromRepository(newRepository, [collection], version, t).then(
            () => {
              if (detail) {
                return navigateAfterDelete(collection, version || false, navigate);
              }
            }
          );
        },
      });
    },
    [
      actionColumns,
      bulkAction,
      confirmationColumns,
      onComplete,
      t,
      version,
      navigate,
      detail,
      repository,
    ]
  );
}

export async function deleteCollectionFromRepository(
  repository: Repository,
  // all the collections must have been from the same repository
  collections: CollectionVersionSearch[],
  // warning if we want to delete versions, we can push only one collection as collections array
  version?: boolean,
  t?: TFunction<'translation', undefined>
) {
  let itemsToDelete: string[] = [];

  if (collections.filter((item) => !item.repository).length > 0) {
    throw new Error(t?.('Collection is missing in the repositories'));
  }

  if (!version && collections.length !== 1) {
    throw new Error(t?.('You can delete all versions only for one collection'));
  }

  // load the repository again, because we need the latest version as much actual as possible
  // the one received from the page can be very obsolete, because when someones modify repo in meantime user clicks this action, it will fail
  const actualRepositoryResults = await requestGet<PulpItemsResponse<Repository>>(
    pulpAPI`/repositories/ansible/ansible/?name=${repository.name}`
  );
  const actualRepository = actualRepositoryResults.results[0];

  let loadedAll = true;

  if (!version) {
    // load all associated collection versions
    // TODO - waiting for API
    const url = hubAPI`/v3/plugin/ansible/search/collection-versions/?limit=100&name=${
      collections[0].collection_version?.name || ''
    }&repository_name=${actualRepository.name || ''}`;

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
    itemsToDelete = collections.map((item) => item.collection_version?.pulp_href || '');
  }

  const res: { task: string } = await postRequest(
    pulpAPI`/repositories/ansible/ansible/${
      parsePulpIDFromURL(actualRepository.pulp_href) || ''
    }/modify/`,
    {
      remove_content_units: itemsToDelete,
      base_version: actualRepository.latest_version_href,
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
