import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IPageAction, PageActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRulebook } from '../../interfaces/EdaRulebook'
import { useDeleteRulebooks } from './useDeleteRulebooks'

export function useRulebooksActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteRulebooks = useDeleteRulebooks(() => void refresh())
  return useMemo<IPageAction<EdaRulebook>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create rulebook'),
        onClick: () => navigate(RouteE.CreateEdaRulebook),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected rulebooks'),
        onClick: (rulebooks: EdaRulebook[]) => deleteRulebooks(rulebooks),
      },
    ],
    [deleteRulebooks, navigate, t]
  )
}
