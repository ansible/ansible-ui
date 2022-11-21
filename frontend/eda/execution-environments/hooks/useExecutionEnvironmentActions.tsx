import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment'
import { useDeleteExecutionEnvironments } from './useDeleteExecutionEnvironments'

export function useExecutionEnvironmentActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(() => void refresh())
  return useMemo<ITypedAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          navigate(
            RouteE.EditEdaExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
          ),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          deleteExecutionEnvironments([executionEnvironment]),
      },
    ],
    [deleteExecutionEnvironments, navigate, t]
  )
}
