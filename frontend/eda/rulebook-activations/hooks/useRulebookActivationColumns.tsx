import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation'

export function useRulebookActivationColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return useMemo<ITableColumn<EdaRulebookActivation>[]>(
    () => [
      {
        header: t('ID'),
        cell: (inventory) => inventory.id,
        isIdColumn: true,
        sort: 'id',
        card: 'hidden',
        list: 'hidden',
        isIdColumn: true,
      },
      {
        header: t('Name'),
        cell: (rulebookActivation) => (
          <TextCell
            text={rulebookActivation.name}
            onClick={() =>
              navigate(
                RouteE.EdaRulebookActivationDetails.replace(':id', rulebookActivation.id.toString())
              )
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
    ],
    [navigate, t]
  )
}
