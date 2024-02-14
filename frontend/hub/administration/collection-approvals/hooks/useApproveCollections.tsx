import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useGetRequest } from '../../../../common/crud/useGet';
import {
  copyToRepositoryAction,
  useCopyToRepository,
} from '../../../collections/hooks/useCopyToRepository';
import { pulpAPI } from '../../../common/api/formatPath';
import { collectionKeyFn } from '../../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../../common/useHubBulkConfirmation';
import { HubContext, useHubContext } from '../../../common/useHubContext';
import { PulpItemsResponse } from '../../../common/useHubView';
import { SigningServiceResponse } from '../../../interfaces/generated/SigningServiceResponse';
import { CollectionVersionSearch } from '../Approval';
import { useApprovalsColumns } from './useApprovalsColumns';

export function useApproveCollectionsFrameworkModal(
  onComplete?: (collections: CollectionVersionSearch[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useApprovalsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);

  const bulkAction = useHubBulkConfirmation<CollectionVersionSearch>();

  const getRequest = useGetRequest();

  const context = useHubContext();
  const { collection_auto_sign, require_upload_signatures } = context.featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  const copyToRepository = useCopyToRepository();
  const pulpRequest = useGetRequest<PulpItemsResponse<SigningServiceResponse>>();

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
        actionButtonText: autoSign
          ? t('Approve and sign collections', { count: collections.length })
          : t('Approve collections', { count: collections.length }),
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
          approveCollection(collection, getRequest, t, context, pulpRequest),
      });
    },
    [
      actionColumns,
      bulkAction,
      confirmationColumns,
      onComplete,
      t,
      getRequest,
      autoSign,
      copyToRepository,
      pulpRequest,
      context,
    ]
  );
}

export function approveCollection(
  collection: CollectionVersionSearch,
  getRequest: ReturnType<typeof useGetRequest>,
  t: TFunction<'translation', undefined>,
  context: HubContext,
  pulpRequest: ReturnType<typeof useGetRequest<PulpItemsResponse<SigningServiceResponse>>>
) {
  let approvedRepo = '';

  async function innerAsync() {
    const repoRes = (await getRequest(
      pulpAPI`/repositories/ansible/ansible/?pulp_label_select=pipeline=approved`
    )) as PulpItemsResponse<Repository>;
    approvedRepo = repoRes.results[0].pulp_href;

    await copyToRepositoryAction(
      collection,
      'approve',
      [{ pulp_href: approvedRepo } as Repository],
      context,
      pulpRequest,
      t
    );
  }

  return innerAsync();
}

export interface Repository {
  name: string;
  pulp_href: string;
}
