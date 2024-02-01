import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useGetRequest } from '../../../../common/crud/useGet';
import { pulpAPI } from '../../../common/api/formatPath';
import { collectionKeyFn, hubAPIPost, parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { PulpItemsResponse } from '../../../common/useHubView';
import { CollectionVersionSearch } from '../Approval';
import { useApprovalsColumns } from './useApprovalsColumns';

export function useRejectCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useApprovalsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);

  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();

  const getRequest = useGetRequest();

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: t('Reject collections', { count: collections.length }),
        confirmText: t('Yes, I confirm that I want to reject these {{count}} collections.', {
          count: collections.length,
        }),
        actionButtonText: t('Reject collections', { count: collections.length }),
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version?.pulp_href || '' + l.repository?.name,
            r.collection_version?.pulp_href || '' + r.repository?.name
          )
        ),
        keyFn: collectionKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) => rejectCollection(collection, getRequest),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, getRequest]
  );
}

export function rejectCollection(
  collection: CollectionVersionSearch,
  getRequest: ReturnType<typeof useGetRequest>
) {
  let rejectedRepo = '';

  async function innerAsync() {
    const repoRes = (await getRequest(
      pulpAPI`/repositories/ansible/ansible/?name=rejected`
    )) as PulpItemsResponse<Repository>;
    rejectedRepo = repoRes.results[0].pulp_href;

    await hubAPIPost(
      pulpAPI`/repositories/ansible/ansible/${parsePulpIDFromURL(
        collection.repository?.pulp_href
      )}/move_collection_version/`,
      {
        collection_versions: [`${collection.collection_version?.pulp_href}`],
        destination_repositories: [rejectedRepo],
      }
    );
  }

  return innerAsync();
}

export interface Repository {
  name: string;
  pulp_href: string;
}
