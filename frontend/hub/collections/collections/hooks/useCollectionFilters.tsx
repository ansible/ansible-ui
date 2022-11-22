import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IToolbarFilter } from '../../../../../framework'

export function useCollectionFilters() {
  const { t } = useTranslation()
  return useMemo<IToolbarFilter[]>(
    () => [
      { key: 'keywords', label: t('Keywords'), type: 'string', query: 'keywords' },
      { key: 'namespace', label: t('Namespace'), type: 'string', query: 'namespace' },
      { key: 'tags', label: t('Tags'), type: 'string', query: 'tags' },
      { key: 'sign-state', label: t('Sign state'), type: 'string', query: 'sign_state' },
    ],
    [t]
  )
}
