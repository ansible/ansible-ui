import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IToolbarFilter } from '../../../../../framework'

export function useCollectionFilters() {
  const { t } = useTranslation()
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'keywords',
        label: t('Keywords'),
        type: 'string',
        query: 'keywords',
        placeholder: t('Enter keywords'),
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: 'string',
        query: 'namespace',
        placeholder: t('Enter namespace'),
      },
      {
        key: 'repository',
        label: t('Repository'),
        type: 'select',
        query: 'repository',
        options: [
          { label: t('Published'), value: 'published' },
          { label: t('Red Hat certified'), value: 'rh-certified' },
          { label: t('Community'), value: 'community' },
          { label: t('Validated'), value: 'validated' },
        ],
        placeholder: t('Select repository'),
      },
      {
        key: 'tags',
        label: t('Tags'),
        type: 'string',
        query: 'tags',
        placeholder: t('Enter tags'),
      },
      {
        key: 'type',
        label: t('Type'),
        type: 'select',
        query: 'type',
        options: [
          { label: t('Synced'), value: 'synced' },
          { label: t('Unsynced'), value: 'unsynced' },
        ],
        placeholder: t('Select type'),
      },
      {
        key: 'signature',
        label: t('Signature'),
        type: 'select',
        query: 'sign_state',
        options: [
          { label: t('Signed'), value: 'signed' },
          { label: t('Unsigned'), value: 'unsigned' },
        ],
        placeholder: t('Select signature'),
      },
    ],
    [t]
  )
}
