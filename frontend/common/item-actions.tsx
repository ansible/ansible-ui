import { CopyIcon, EditIcon, TrashIcon } from '@patternfly/react-icons'
import { useTranslation } from 'react-i18next'
import { IItemAction } from '../../framework'

export function useDeleteItemAction<T>(onClick: (item: T) => void) {
    const { t } = useTranslation()
    const action: IItemAction<T> = {
        icon: TrashIcon,
        label: t('Delete'),
        onClick,
    }
    return action
}

export function useCopyItemAction<T>() {
    const { t } = useTranslation()
    const action: IItemAction<T> = {
        icon: CopyIcon,
        label: t('Copy'),
        onClick: () => null,
    }
    return action
}

export function useEditItemAction<T>(onClick: (item: T) => void) {
    const { t } = useTranslation()
    const action: IItemAction<T> = {
        icon: EditIcon,
        label: t('Edit'),
        onClick,
    }
    return action
}

export const deleteItemAction: IItemAction<unknown> = {
    label: 'Delete',
    onClick: () => null,
}
