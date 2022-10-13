import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ITableColumn,
    IToolbarFilter,
    Labels,
    PageBody,
    PageHeader,
    PageLayout,
    PageTable,
    SinceCell,
    TextCell,
} from '../../../../framework'
import { idKeyFn, useHubView } from '../../useHubView'
import { Collection } from './Collection'

export function Collections() {
    const { t } = useTranslation()
    const toolbarFilters = useCollectionFilters()
    const tableColumns = useCollectionsColumns()
    const view = useHubView<Collection>('/api/automation-hub/_ui/v1/repo/published/', idKeyFn, toolbarFilters, tableColumns)
    return (
        <PageLayout>
            <PageHeader title={t('Collections')} />
            <PageBody>
                <PageTable<Collection>
                    toolbarFilters={toolbarFilters}
                    tableColumns={tableColumns}
                    errorStateTitle={t('Error loading collections')}
                    emptyStateTitle={t('No collections yet')}
                    {...view}
                />
            </PageBody>
        </PageLayout>
    )
}

export function useCollectionsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const tableColumns = useMemo<ITableColumn<Collection>[]>(
        () => [
            { header: t('Name'), cell: (collection) => <TextCell text={collection.name} /> },
            { header: t('Description'), cell: (collection) => <TextCell text={collection.latest_version.metadata.description} /> },
            { header: t('Created'), cell: (collection) => <SinceCell value={collection.latest_version.created_at} /> },
            { header: t('Version'), cell: (collection) => <TextCell text={collection.latest_version.version} /> },
            { header: t('Signed state'), cell: (collection) => <TextCell text={collection.latest_version.sign_state} /> },
            { header: t('Tags'), cell: (collection) => <Labels labels={collection.latest_version.metadata.tags.sort()} /> },
        ],
        [t]
    )
    return tableColumns
}

export function useCollectionFilters() {
    const { t } = useTranslation()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            { key: 'keywords', label: t('Keywords'), type: 'string', query: 'keywords' },
            { key: 'tags', label: t('Tags'), type: 'string', query: 'tags' },
            { key: 'sign-state', label: t('Sign state'), type: 'string', query: 'sign_state' },
        ],
        [t]
    )
    return toolbarFilters
}
