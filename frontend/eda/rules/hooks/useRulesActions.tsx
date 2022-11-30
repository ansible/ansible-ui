import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IPageAction, PageActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRule } from '../../interfaces/EdaRule'
import { useDeleteRules } from './useDeleteRules'

export function useRulesActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRules = useDeleteRules(() => void refresh())
  return useMemo<IPageAction<EdaRule>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create rule'),
        onClick: () => navigate(RouteE.CreateEdaRule),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected rules'),
        onClick: (rules: EdaRule[]) => deleteRules(rules),
      },
    ],
    [deleteRules, navigate, t]
  )
}
