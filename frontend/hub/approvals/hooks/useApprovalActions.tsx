import { ThumbsDownIcon, ThumbsUpIcon, UploadIcon } from '@patternfly/react-icons';
import { ButtonVariant } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';
import { useApproveCollections } from './useApproveCollections';
import { useHubContext } from './../../useHubContext';
import { usePageNavigate } from '../../../../framework';
import { HubRoute } from '../../../hub/HubRoutes';
import { useParams } from 'react-router-dom';

export function useApprovalActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams();
  const rejectCollections = useRejectCollections(callback);
  const approveCollections = useApproveCollections(callback);
  const { featureFlags } = useHubContext();
  const { collection_auto_sign, require_upload_signatures, can_upload_signatures } = featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
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
        onClick: (collection) => approveCollections([collection]),
        isDanger: false,
        isDisabled: (collection) =>
          can_upload_signatures && require_upload_signatures && collection.is_signed
            ? t`You do not have rights to this operation`
            : undefined,
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
      },
    ],
    [
      t,
      rejectCollections,
      approveCollections,
      autoSign,
      can_upload_signatures,
      require_upload_signatures,
      pageNavigate,
      params,
    ]
  );
}
