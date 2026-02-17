import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCopyToRepository } from '../../../collections/hooks/useCopyToRepository';
import { isInsightsMode } from '../../../common/isInsights';
import { useHubContext } from '../../../common/useHubContext';
import { CollectionVersionSearch } from '../Approval';
import { approveCollection } from './useApprovalActions';
import { useApproveCollectionsFrameworkModal } from './useApproveCollections';
import { useRejectCollections } from './useRejectCollections';

export function useApprovalsActions(callback: (collections: CollectionVersionSearch[]) => void) {
  const { t } = useTranslation();
  const rejectCollections = useRejectCollections(callback);

  const copyToRepository = useCopyToRepository(callback);
  const approveCollectionsFrameworkModal = useApproveCollectionsFrameworkModal(callback);
  const { hasPermission, user } = useHubContext();

  // In Insights mode, require ansible.modify_ansible_repo_content for approve/reject toolbar actions
  const isInsights = isInsightsMode();
  const canModifyRepoContent =
    !isInsights || hasPermission('ansible.modify_ansible_repo_content') || !!user?.is_superuser;

  return useMemo<IPageAction<CollectionVersionSearch>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsUpIcon,
        label: t('Approve and sign collections'),
        onClick: (items) =>
          approveCollection(items, copyToRepository, approveCollectionsFrameworkModal, true, t),
        isDanger: false,
        isHidden: () => !canModifyRepoContent,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: ThumbsDownIcon,
        label: t('Reject collections'),
        onClick: rejectCollections,
        isDanger: true,
        isHidden: () => !canModifyRepoContent,
      },
    ],
    [t, rejectCollections, approveCollectionsFrameworkModal, copyToRepository, canModifyRepoContent]
  );
}
