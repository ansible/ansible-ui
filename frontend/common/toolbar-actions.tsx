import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { ITypedAction, TypedActionType } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../route'

export function useCreateToolbarAction(route: RouteE) {
    const { t } = useTranslation()
    const history = useHistory()
    const toolbarAction: ITypedAction<{ id: number }> = useMemo(
        () => ({
            type: TypedActionType.button,
            variant: ButtonVariant.primary,
            icon: PlusIcon,
            label: t('Create team'),
            shortLabel: t('Create'),
            onClick: () => history.push(route),
        }),
        [history, route, t]
    )
    return toolbarAction
}

export function useDeleteToolbarAction<T extends object>(onClick: (items: T[]) => void) {
    const { t } = useTranslation()
    const toolbarAction: ITypedAction<T> = useMemo(
        () => ({
            type: TypedActionType.bulk,
            variant: ButtonVariant.primary,
            icon: TrashIcon,
            label: t('Delete selected teams'),
            shortLabel: t('Delete'),
            onClick,
        }),
        [onClick, t]
    )
    return toolbarAction
}

export function useSyncToolbarAction() {
    const { t } = useTranslation()
    const toolbarAction: ITypedAction<{ id: number }> = useMemo(
        () => ({
            type: TypedActionType.bulk,
            icon: SyncIcon,
            label: t('Sync'),
            onClick: () => null,
        }),
        [t]
    )
    return toolbarAction
}
