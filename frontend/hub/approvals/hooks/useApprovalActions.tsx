import { ButtonVariant } from '@patternfly/react-core'
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IPageAction, PageActionType } from '../../../../framework'
import { Approval } from '../Approval'

export function useApprovalActions() {
  const { t } = useTranslation()

  return useMemo<IPageAction<Approval>[]>(
    () => [
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: ThumbsUpIcon,
        label: t('Approve'),
        onClick: () => {
          alert('TODO')
        },
        isDisabled: (item) =>
          item.repository_list.includes('published') ? 'Already approved' : '',
      },
      {
        type: PageActionType.single,
        variant: ButtonVariant.primary,
        icon: ThumbsDownIcon,
        label: t('Reject'),
        onClick: () => {
          alert('TODO')
        },
        isDisabled: (item) =>
          item.repository_list.includes('published') ? 'Already approved' : '',
      },
    ],
    [t]
  )
}
