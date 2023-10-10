import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useGetRequest } from '../../../common/crud/useGet';
import { collectionKeyFn, parsePulpIDFromURL, pulpAPI, hubAPIPost } from '../../api/utils';
import { PulpItemsResponse } from '../../usePulpView';
import { CollectionVersionSearch } from '../Approval';
import { useApprovalsColumns } from './useApprovalsColumns';
import { useHubContext } from './../../useHubContext';

export function useApproveCollections(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useApprovalsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);

  const bulkAction = useBulkConfirmation<CollectionVersionSearch>();

  const getRequest = useGetRequest();

  const { featureFlags } = useHubContext();
  const { collection_auto_sign, require_upload_signatures } = featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  return useCallback(
    (collections: CollectionVersionSearch[]) => {
      bulkAction({
        title: autoSign
          ? t('Approve and sign collections', { count: collections.length })
          : t('Approve collections', { count: collections.length }),
        confirmText: autoSign
          ? t('Yes, I confirm that I want to approve and sign these {{count}} collections.', {
              count: collections.length,
            })
          : t('Yes, I confirm that I want to approve these {{count}} collections.', {
              count: collections.length,
            }),
        actionButtonText: t('Approve collections', { count: collections.length }),
        items: collections.sort((l, r) =>
          compareStrings(
            l.collection_version?.pulp_href || '' + l.repository?.name,
            r.collection_version?.pulp_href || '' + r.repository?.name
          )
        ),
        keyFn: collectionKeyFn,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (collection: CollectionVersionSearch) =>
          approveCollection(collection, getRequest),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, getRequest, autoSign]
  );
}

export function approveCollection(
  collection: CollectionVersionSearch,
  getRequest: ReturnType<typeof useGetRequest>
) {
  let approvedRepo = '';

  async function innerAsync() {
    const repoRes = (await getRequest(
      pulpAPI`/repositories/ansible/ansible/?pulp_label_select=pipeline=approved`
    )) as PulpItemsResponse<Repository>;
    approvedRepo = repoRes.results[0].pulp_href;

    await hubAPIPost(
      pulpAPI`/repositories/ansible/ansible/${
        parsePulpIDFromURL(collection.repository?.pulp_href || '') || ''
      }/move_collection_version/`,
      {
        collection_versions: [`${collection.collection_version?.pulp_href}`],
        destination_repositories: [approvedRepo],
      }
    );
  }

  return innerAsync();
}

export interface Repository {
  name: string;
  pulp_href: string;
}
