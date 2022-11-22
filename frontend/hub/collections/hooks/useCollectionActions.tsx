import { ButtonVariant } from '@patternfly/react-core'
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITypedAction, TypedActionType } from '../../../../framework'
import { Collection } from '../Collection'

export function useCollectionActions(_callback?: () => void) {
  const { t } = useTranslation()
  return useMemo<ITypedAction<Collection>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: t('Upload new version'),
        onClick: () => {
          /**/
        },
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.button,
        icon: TrashIcon,
        label: t('Delete entire collection'),
        onClick: () => {
          /**/
        },
      },
      {
        type: TypedActionType.button,
        icon: BanIcon,
        label: t('Deprecate collection'),
        onClick: () => {
          /**/
        },
      },
    ],
    [t]
  )
}
