import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IToolbarFilter } from '../../../../framework'

export function useRulebookActivationFilters() {
  const { t } = useTranslation()
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'name',
        placeholder: t('Filter by name'),
      },
    ],
    [t]
  )
}
