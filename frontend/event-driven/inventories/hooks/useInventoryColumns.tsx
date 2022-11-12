import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaInventory } from '../../interfaces/EdaInventory'

export function useInventoriesColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tableColumns = useMemo<ITableColumn<EdaInventory>[]>(
    () => [
      {
        header: t('Name'),
        cell: (inventory) => (
          <TextCell
            text={inventory.name}
            onClick={() =>
              navigate(RouteE.EdaInventoryDetails.replace(':id', inventory.id.toString()))
            }
          />
        ),
      },
    ],
    [navigate, t]
  )
  return tableColumns
}
