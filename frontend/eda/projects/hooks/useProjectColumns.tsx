import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaProject } from '../../interfaces/EdaProject'

export function useProjectColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return useMemo<ITableColumn<EdaProject>[]>(
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
        cell: (project) => (
          <TextCell
            text={project.name}
            onClick={() => navigate(RouteE.EdaProjectDetails.replace(':id', project.id.toString()))}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Url'),
        cell: (project) => project.url && <TextCell text={project.url} />,
        card: 'description',
        list: 'description',
      },
    ],
    [navigate, t]
  )
}
