import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';
import { useApproveCollections } from './useApproveCollections';

export function useApprovalActions(callback?: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();

  const rejectCollections = useRejectCollections(callback);
  const approveCollections = useApproveCollections(callback);

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: (collection) => approveCollections([collection]),
        isDanger: false,
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
    [t, rejectCollections, approveCollections]
  );
}
