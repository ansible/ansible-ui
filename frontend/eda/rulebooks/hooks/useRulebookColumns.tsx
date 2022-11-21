import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaRulebook } from '../../interfaces/EdaRulebook'

export function useRulebookColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return useMemo<ITableColumn<EdaRulebook>[]>(
    () => [
      {
        header: t('ID'),
        cell: (inventory) => inventory.id,
        isIdColumn: true,
        sort: 'id',
      },
      {
        header: t('Name'),
        cell: (rulebook) => (
          <TextCell
            text={rulebook.name}
            onClick={() =>
              navigate(RouteE.EdaRulebookDetails.replace(':id', rulebook.id.toString()))
            }
          />
        ),
        sort: 'name',
        primary: true,
        defaultSort: true,
      },
    ],
    [navigate, t]
  )
}
