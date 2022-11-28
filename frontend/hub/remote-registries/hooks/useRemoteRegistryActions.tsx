import { EditIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { RemoteRegistry } from '../RemoteRegistry'

export function useRemoteRegistryActions() {
  const { t } = useTranslation()
  return useMemo<ITypedAction<RemoteRegistry>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: EditIcon,
        label: t('Edit'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
}
