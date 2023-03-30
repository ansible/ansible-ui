import { ButtonVariant } from '@patternfly/react-core';
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType, usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Approval } from '../Approval';

export function useApprovalActions(callback: (approval: Approval[]) => void) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();
  return useMemo<IPageAction<Approval>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: (approval) =>
          void postRequest(
            `/api/automation-hub/v3/collections/${approval.namespace}/${approval.name}/versions/${approval.version}/move/staging/published/`,
            {}
          ).then(() => {
            alertToaster.addAlert({ title: t(`Collection "${approval.name}" approved.`) });
            callback([approval]);
          }),
        isHidden: (item) => item.repository_list.includes('published'),
      },
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
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
