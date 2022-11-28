import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITableColumn, SinceCell, TextCell } from '../../../../framework'
import { RemoteRegistry } from '../RemoteRegistry'

export function useRemoteRegistriesColumns(_options?: {
  disableSort?: boolean
  disableLinks?: boolean
}) {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<RemoteRegistry>[]>(
    () => [
      {
        header: t('Name'),
        cell: (remoteRegistry) => <TextCell text={remoteRegistry.name} />,
      },
      {
        header: t('Created'),
        cell: (remoteRegistry) => <SinceCell value={remoteRegistry.created_at} />,
      },
      {
        header: t('Registry URL'),
        cell: (remoteRegistry) => <TextCell text={remoteRegistry.url} />,
      },
    ],
    [t]
  )
  return tableColumns
}
