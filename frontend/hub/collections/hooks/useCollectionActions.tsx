import { ButtonVariant } from '@patternfly/react-core'
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IPageAction, PageActionType } from '../../../../framework'
import { Collection } from '../Collection'

export function useCollectionActions(_callback?: () => void) {
  const { t } = useTranslation()
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: t('Upload new version'),
        onClick: () => {
          /**/
        },
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.button,
        icon: TrashIcon,
        label: t('Delete entire collection'),
        onClick: () => {
          /**/
        },
      },
      {
        type: PageActionType.button,
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
