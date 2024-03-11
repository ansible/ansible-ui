import { ButtonVariant } from '@patternfly/react-core';
import { ThumbsDownIcon, ThumbsUpIcon, UploadIcon, ImportIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { requestGet } from '../../../../common/crud/Data';
import { pulpAPI } from '../../../common/api/formatPath';
import { PulpItemsResponse } from '../../../common/useHubView';
import { Repository } from '../../repositories/Repository';

import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { useHubContext } from '../../../common/useHubContext';
import { HubRoute } from '../../../main/HubRoutes';
import { CollectionVersionSearch } from '../Approval';
import { useApproveCollectionsFrameworkModal } from './useApproveCollections';
import { useRejectCollections } from './useRejectCollections';
import { useCopyToRepository } from '../../../collections/hooks/useCopyToRepository';
import { TFunction } from 'i18next';

export function useApprovalActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams();
  const rejectCollections = useRejectCollections(callback);
  const approveCollectionsFrameworkModal = useApproveCollectionsFrameworkModal(callback);
  const { featureFlags } = useHubContext();
  const { collection_auto_sign, require_upload_signatures, can_upload_signatures } = featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  const copyToRepository = useCopyToRepository(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: UploadIcon,
        label: t('Upload signature'),
        onClick: (i) => {
          pageNavigate(HubRoute.CollectionSignatureUpload, {
            params: { ...params },
            query: {
              name: i?.collection_version?.name,
              namespace: i?.collection_version?.namespace,
              repository: i?.repository?.name,
              version: i?.collection_version?.version,
            },
          });
        },
        isDanger: false,
        isDisabled: (collection) =>
          can_upload_signatures || collection.is_signed
            ? t('You do not have rights to this operation')
            : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: ThumbsUpIcon,
        label: autoSign ? t('Sign and approve') : t('Approve'),
        onClick: (collection) =>
          approveCollection(
            [collection],
            copyToRepository,
            approveCollectionsFrameworkModal,
            false,
            t
          ),
        isDanger: false,
        isDisabled: (collection) =>
          collection?.repository?.pulp_labels?.pipeline === 'approved'
            ? t`Collection is already approved`
            : can_upload_signatures && require_upload_signatures && !collection.is_signed
              ? t`Signature must be uploaded first`
              : undefined,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: ImportIcon,
        label: t('View Import Logs'),
        onClick: (collection) =>
          pageNavigate(HubRoute.MyImports, {
            query: {
              namespace: collection?.collection_version?.namespace,
              name: collection?.collection_version?.name,
              version: collection?.collection_version?.version,
            },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: ThumbsDownIcon,
        label: t('Reject'),
        onClick: (collection) => rejectCollections([collection]),
        isDanger: true,
        isDisabled: (collection) =>
          collection?.repository?.pulp_labels?.pipeline === 'rejected'
            ? t`Collection is already rejected`
            : undefined,
      },
    ],
    [
      t,
      rejectCollections,
      approveCollectionsFrameworkModal,
      autoSign,
      can_upload_signatures,
      require_upload_signatures,
      pageNavigate,
      params,
      copyToRepository,
    ]
  );
}

export function approveCollection(
  collections: CollectionVersionSearch[],
  copyToRepository: ReturnType<typeof useCopyToRepository>,
  approveCollectionsFrameworkModal: ReturnType<typeof useApproveCollectionsFrameworkModal>,
  bulkAction: boolean,
  t: TFunction<'translation', undefined>
) {
  void (async () => {
    const repoRes = await requestGet<PulpItemsResponse<Repository>>(
      pulpAPI`/repositories/ansible/ansible/?pulp_label_select=pipeline=approved`
    );

    if (repoRes.count > 1) {
      copyToRepository(
        collections[0],
        'approve',
        bulkAction
          ? t(`You can only use bulk action when there is only one approved repository available.`)
          : undefined
      );
    } else {
      approveCollectionsFrameworkModal(collections);
    }
  })();
}
