import { ButtonVariant } from '@patternfly/react-core'
import { BanIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IPageAction, PageActionType } from '../../../../framework'
import { requestPost } from '../../../Data'
import { Collection } from '../Collection'
import { useUploadCollection } from './useUploadCollection'

export function useCollectionsActions(_callback?: () => void) {
  const { t } = useTranslation()
  const uploadCollection = useUploadCollection()
  return useMemo<IPageAction<Collection>[]>(
    () => [
      {
        type: PageActionType.button,
        icon: UploadIcon,
        variant: ButtonVariant.primary,
        label: t('Upload collection'),
        onClick: () => {
          uploadCollection({
            title: t('Upload collection'),
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
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected collections'),
        onClick: () => {
          /**/
        },
      },
      {
        type: PageActionType.bulk,
        icon: BanIcon,
        label: t('Deprecate selected collections'),
        onClick: () => {
          /**/
        },
      },
    ],
    [uploadCollection, t]
  )
}
