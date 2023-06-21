import { ButtonVariant } from '@patternfly/react-core';
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { Approval } from '../Approval';
import { hubAPI } from '../../api';

export function useApprovalActions(callback: (approval: Approval[]) => void) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();
  return useMemo<IPageAction<Approval>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: (approval) =>
          void postRequest(
            hubAPI`/v3/collections/${approval.namespace}/${approval.name}/versions/${approval.version}/move/staging/published/`,
            {}
          ).then(() => {
            alertToaster.addAlert({ title: t(`Collection "${approval.name}" approved.`) });
            callback([approval]);
          }),
        isHidden: (item) => item.repository_list.includes('published'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: ThumbsDownIcon,
        label: t('Reject'),
        onClick: () => {
          alert('TODO');
        },
        isHidden: (item) => item.repository_list.includes('published'),
      },
    ],
    [alertToaster, callback, postRequest, t]
  );
}
