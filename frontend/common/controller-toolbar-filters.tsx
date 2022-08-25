import { useMemo } from 'react'
import { useTranslation } from '../../framework/components/useTranslation'
import { IToolbarFilter } from '../../framework/PageToolbar'

export function useNameToolbarFilter() {
    const { t } = useTranslation()
    return useMemo<IToolbarFilter>(
        () => ({
            key: 'name',
            label: t('Name'),
            type: 'string',
            query: 'name__icontains',
        }),
        [t]
    )
}

export function useOrganizationToolbarFilter() {
    const { t } = useTranslation()
    return useMemo<IToolbarFilter>(
        () => ({
            key: 'organization',
            label: t('Organization'),
            type: 'string',
            query: 'organization__name__icontains',
        }),
        [t]
    )
}

export function useCreatedByToolbarFilter() {
    const { t } = useTranslation()
    return useMemo<IToolbarFilter>(
        () => ({
            key: 'created-by',
            label: t('Created By'),
            type: 'string',
            query: 'created_by__username__icontains',
        }),
        [t]
    )
}

export function useModifiedByToolbarFilter() {
    const { t } = useTranslation()
    return useMemo<IToolbarFilter>(
        () => ({
            key: 'modified-by',
            label: t('Modified By'),
            type: 'string',
            query: 'modified_by__username__icontains',
        }),
        [t]
    )
}
