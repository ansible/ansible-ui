import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { ExecutionEnvironment } from '../ExecutionEnvironment'

export function useExecutionEnvironmentsActions() {
  const { t } = useTranslation()
  return useMemo<ITypedAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add execution environment'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
}
