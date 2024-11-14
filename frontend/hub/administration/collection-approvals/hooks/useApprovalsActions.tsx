import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCopyToRepository } from '../../../collections/hooks/useCopyToRepository';
import { useHubContext } from '../../../common/useHubContext';
import { CollectionVersionSearch } from '../Approval';
import { approveCollection } from './useApprovalActions';
import { useApproveCollectionsFrameworkModal } from './useApproveCollections';
import { useRejectCollections } from './useRejectCollections';

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
        icon: ThumbsUpIcon,
        label: autoSign ? t('Approve and sign collections') : t('Approve and sign collections'),
        onClick: (items) =>
          approveCollection(items, copyToRepository, approveCollectionsFrameworkModal, true, t),
        isDanger: false,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsDownIcon,
        label: t('Reject collections'),
        onClick: rejectCollections,
        isDanger: true,
      },
    ],
    [t, rejectCollections, autoSign, approveCollectionsFrameworkModal, copyToRepository]
  );
}
