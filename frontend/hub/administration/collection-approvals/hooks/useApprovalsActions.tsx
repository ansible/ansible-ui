import { ThumbsUpIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { useHubContext } from '../../../common/useHubContext';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';
import { approveCollection } from './useApprovalActions';
import { useCopyToRepository } from '../../../collections/hooks/useCopyToRepository';
import { useApproveCollectionsFrameworkModal } from './useApproveCollections';

export function useApprovalsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const rejectCollections = useRejectCollections(callback);
  const { featureFlags } = useHubContext();
  const { collection_auto_sign, require_upload_signatures } = featureFlags;
  const autoSign = collection_auto_sign && !require_upload_signatures;

  const copyToRepository = useCopyToRepository(callback);
  const approveCollectionsFrameworkModal = useApproveCollectionsFrameworkModal(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Reject selected collections'),
        onClick: rejectCollections,
        isDanger: true,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsUpIcon,
        label: autoSign
          ? t('Sign and approve selected collections')
          : t('Approve selected collections'),
        onClick: (items) =>
          approveCollection(items, copyToRepository, approveCollectionsFrameworkModal, true, t),
        isDanger: false,
      },
    ],
    [t, rejectCollections, autoSign, approveCollectionsFrameworkModal, copyToRepository]
  );
}
