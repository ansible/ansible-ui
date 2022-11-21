import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { EdaExecutionEnvironment } from '../../interfaces/EdaExecutionEnvironment'

export function useExecutionEnvironmentColumns() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return useMemo<ITableColumn<EdaExecutionEnvironment>[]>(
    () => [
      {
        header: t('Name'),
        cell: (executionEnvironment) => (
          <TextCell
            text={executionEnvironment.name}
            onClick={() =>
              navigate(
                RouteE.EdaExecutionEnvironmentDetails.replace(
                  ':id',
                  executionEnvironment.id.toString()
                )
              )
            }
          />
        ),
        sort: 'name',
      },
    ],
    [navigate, t]
  )
}
