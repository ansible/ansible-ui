import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IToolbarFilter } from '../../../../framework'

export function useProjectsFilters() {
  const { t } = useTranslation()
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'name',
        placeholder: 'Filter by name',
      },
    ],
    [t]
  )
}
