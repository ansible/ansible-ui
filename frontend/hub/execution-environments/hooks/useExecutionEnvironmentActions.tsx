import { EditIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { ExecutionEnvironment } from '../ExecutionEnvironment'

export function useExecutionEnvironmentActions() {
  const { t } = useTranslation()
  return useMemo<ITypedAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
}
