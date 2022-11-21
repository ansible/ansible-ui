import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment'
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments'

export function useExecutionEnvironmentsActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const refreshHandler = useCallback(() => void refresh(), [refresh])
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(refreshHandler)
  return useMemo<ITypedAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create execution environment'),
        onClick: () => navigate(RouteE.CreateEdaExecutionEnvironment),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected execution environments'),
        onClick: (executionEnvironments: EdaExecutionEnvironment[]) =>
          deleteExecutionEnvironments(executionEnvironments),
      },
    ],
    [deleteExecutionEnvironments, navigate, t]
  )
}
