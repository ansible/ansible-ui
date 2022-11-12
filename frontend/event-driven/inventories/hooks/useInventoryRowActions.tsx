import { EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaInventory } from '../../interfaces/EdaInventory'
import { useDeleteInventories } from './useDeleteInventories'

export function useInventoryRowActions(refresh: () => Promise<unknown>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deleteInventories = useDeleteInventories(() => void refresh())
  const rowActions = useMemo<ITypedAction<EdaInventory>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit inventory'),
        onClick: (inventory: EdaInventory) =>
          navigate(RouteE.EditEdaInventory.replace(':id', inventory.id.toString())),
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete inventory'),
        onClick: (inventory: EdaInventory) => deleteInventories([inventory]),
      },
    ],
    [deleteInventories, navigate, t]
  )
  return rowActions
}
