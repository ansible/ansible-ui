import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IToolbarFilter } from '../../../../framework'

export function useApprovalFilters() {
  const { t } = useTranslation()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'collection',
        label: t('Collection'),
        type: 'string',
        query: 'name',
        placeholder: t('Enter collection'),
      },
      {
        key: 'namespace',
        label: t('Namespace'),
        type: 'string',
        query: 'namespace',
        placeholder: t('Enter namespace'),
      },
      {
        key: 'status',
        label: t('Status'),
        type: 'select',
        query: 'repository',
        options: [
          { label: t('Needs review'), value: 'staging' },
          { label: t('Approved'), value: 'published' },
          { label: t('Rejected'), value: 'rejected' },
        ],
        placeholder: t('Select statuses'),
      },
    ],
    [t]
  )
  return toolbarFilters
}
