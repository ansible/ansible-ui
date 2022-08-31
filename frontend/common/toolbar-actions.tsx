import { ButtonVariant } from '@patternfly/react-core'
import { PlusIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { IToolbarAction, ToolbarActionType } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../route'

export function useCreateToolbarAction(route: RouteE) {
    const { t } = useTranslation()
    const history = useHistory()
    const toolbarAction: IToolbarAction<{ id: number }> = useMemo(
        () => ({
            type: ToolbarActionType.button,
            variant: ButtonVariant.primary,
            icon: PlusIcon,
            label: t('Create'),
            onClick: () => history.push(route),
        }),
        [history, route, t]
    )
    return toolbarAction
}

export function useDeleteToolbarAction(onClick: () => void) {
    const { t } = useTranslation()
    const toolbarAction: IToolbarAction<{ id: number }> = useMemo(
        () => ({
            type: ToolbarActionType.bulk,
            // variant: ButtonVariant.secondary,
            icon: TrashIcon,
            label: t('Delete'),
            onClick,
        }),
        [onClick, t]
    )
    return toolbarAction
}

export function useSyncToolbarAction() {
    const { t } = useTranslation()
    const toolbarAction: IToolbarAction<{ id: number }> = useMemo(
        () => ({
            type: ToolbarActionType.bulk,
            icon: SyncIcon,
            label: t('Sync'),
            onClick: () => null,
        }),
        [t]
    )
    return toolbarAction
}
