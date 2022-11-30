import { ButtonVariant } from '@patternfly/react-core'
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IPageAction, PageActionType } from '../../../../framework'
import { requestPost } from '../../../Data'
import { Collection } from '../Collection'
import { useUploadCollection } from './useUploadCollection'

export function useCollectionActions(_callback?: () => void) {
  const { t } = useTranslation()
  const uploadCollection = useUploadCollection()
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: t('Upload new version'),
        onClick: () => {
          uploadCollection({
            title: t('Upload collection version'),
            onClose: (data) => {
              if (!data) return
              void requestPost(
                '/api/automation-hub/content/inbound-ansible/v3/artifacts/collections/',
                data
              )
            },
          })
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
    [uploadCollection, t]
  )
}
