import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaProject } from '../../interfaces/EdaProject'

export function useProjectsColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tableColumns = useMemo<ITableColumn<EdaProject>[]>(
    () => [
      {
        header: t('Name'),
        cell: (project) => (
          <TextCell
            text={project.name}
            onClick={() => navigate(RouteE.EdaProjectDetails.replace(':id', project.id.toString()))}
          />
        ),
      },
      {
        header: t('Url'),
        cell: (project) => project.url && <TextCell text={project.url} />,
        card: 'description',
      },
    ],
    [navigate, t]
  )
  return tableColumns
}
