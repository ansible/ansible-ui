import { CopyIcon, EditIcon, TrashIcon } from '@patternfly/react-icons'
import { IItemAction } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'

export function useDeleteItemAction() {
    const { t } = useTranslation()
    const action: IItemAction<{ id: number }> = {
        icon: TrashIcon,
        label: t('Delete'),
        onClick: () => null,
    }
    return action
}

export function useCopyItemAction() {
    const { t } = useTranslation()
    const action: IItemAction<{ id: number }> = {
        icon: CopyIcon,
        label: t('Copy'),
        onClick: () => null,
    }
    return action
}

export function useEditItemAction() {
    const { t } = useTranslation()
    const action: IItemAction<{ id: number }> = {
        icon: EditIcon,
        label: t('Edit'),
        onClick: () => null,
    }
    return action
}

export const deleteItemAction: IItemAction<{ id: number }> = {
    label: 'Delete',
    onClick: () => null,
}
