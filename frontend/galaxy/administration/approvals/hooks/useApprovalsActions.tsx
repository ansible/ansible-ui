import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { Approval } from '../Approval';

export function useApprovalsActions() {
  const { t } = useTranslation();
  return useMemo<IPageAction<Approval>[]>(
    () => [
      {
        type: PageActionType.bulk,
        icon: ThumbsUpIcon,
        label: t('Approve collections'),
        onClick: () => {
          alert('TODO');
        },
      },
      {
        type: PageActionType.bulk,
        icon: ThumbsDownIcon,
        label: t('Deny collections'),
        onClick: () => {
          alert('TODO');
        },
      },
    ],
    [t]
  );
}
