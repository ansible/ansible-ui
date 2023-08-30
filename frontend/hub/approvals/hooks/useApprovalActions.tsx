import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';
import { useApproveCollections } from './useApproveCollections';
import { useHubContext } from './../../useHubContext';

export function useApprovalActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();

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
        icon: ThumbsUpIcon,
        label: autoSign ? t('Sign and approve') : t('Approve'),
        onClick: (collection) => approveCollections([collection]),
        isDanger: false,
        isDisabled: (collection) =>
          can_upload_signatures && require_upload_signatures && collection.is_signed ? true : false,
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
    ]
  );
}
