import { ButtonVariant } from '@patternfly/react-core'
import { ThumbsDownIcon, ThumbsUpIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { Approval } from '../Approval'

export function useApprovalsActions() {
  const { t } = useTranslation()
  return useMemo<ITypedAction<Approval>[]>(
    () => [
      {
        type: TypedActionType.bulk,
        variant: ButtonVariant.primary,
        icon: ThumbsUpIcon,
        label: t('Approve collections'),
        onClick: () => {
          alert('TODO')
        },
      },
      {
        type: TypedActionType.bulk,
        icon: ThumbsDownIcon,
        label: t('Deny collections'),
        onClick: () => {
          alert('TODO')
        },
      },
    ],
    [t]
  )
}
