import { CogIcon, EditIcon, SyncIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    PageBody,
    PageHeader,
    PageLayout,
    PageTab,
    PageTable,
    PageTabs,
    SinceCell,
    TextCell,
} from '../../../../framework'
import { RouteE } from '../../../Routes'
import { hubKeyFn, nameKeyFn, useHubView } from '../../useHubView'
import { RemoteRepository, Repository } from './Repository'

export function Repositories() {
    const { t } = useTranslation()
    return (
        <PageLayout>
            <PageHeader title={t('Repositories')} />
            <PageBody>
                <PageTabs>
                    <PageTab title={t('Local')}>
                        <LocalRepositories />
                    </PageTab>
                    <PageTab title={t('Remote')}>
                        <RemoteRepositories />
                    </PageTab>
                </PageTabs>
            </PageBody>
        </PageLayout>
    )
}

export function LocalRepositories() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const tableColumns = useLocalRepositoriesColumns()
    const view = useHubView<Repository>('/api/automation-hub/_ui/v1/distributions/', hubKeyFn, undefined, tableColumns)
    return (
        <PageTable<Repository>
            // toolbarFilters={toolbarFilters}
            tableColumns={tableColumns}
            errorStateTitle={t('Error loading repositories')}
            emptyStateTitle={t('No repositories yet')}
            emptyStateDescription={t('To get started, create an repository.')}
            emptyStateButtonText={t('Add repository')}
            emptyStateButtonClick={() => navigate(RouteE.CreateRepository)}
            {...view}
        />
    )
}

export function useLocalRepositoriesColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const tableColumns = useMemo<ITableColumn<Repository>[]>(
        () => [
            { header: 'Name', cell: (repository) => <TextCell text={repository.name} /> },
            { header: 'Repository', cell: (repository) => <TextCell text={repository.repository.name} /> },
            { header: 'Description', cell: (repository) => <TextCell text={repository.repository.description} /> },
            { header: 'Collections', cell: (repository) => <TextCell text={repository.repository.content_count.toString()} /> },
            { header: 'Modified', cell: (repository) => <SinceCell value={repository.repository.pulp_last_updated} /> },
        ],
        []
    )
    return tableColumns
}

export function RemoteRepositories() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const tableColumns = useRemoteRepositoriesColumns()
    const view = useHubView<RemoteRepository>('/api/automation-hub/_ui/v1/remotes/', nameKeyFn, undefined, tableColumns)
    const rowActions = useMemo<IItemAction<RemoteRepository>[]>(
        () => [
            {
                icon: CogIcon,
                label: t('Configure repository'),
                onClick: (repository) => navigate(RouteE.EditRepository.replace(':id', repository.name.toString())),
            },
            {
                icon: SyncIcon,
                label: t('Sync repository'),
                onClick: (repository) => navigate(RouteE.EditRepository.replace(':id', repository.name.toString())),
            },
            {
                icon: EditIcon,
                label: t('Edit repository'),
                onClick: (repository) => navigate(RouteE.EditRepository.replace(':id', repository.name.toString())),
            },
        ],
        [navigate, t]
    )
    return (
        <PageTable<RemoteRepository>
            rowActions={rowActions}
            tableColumns={tableColumns}
            errorStateTitle={t('Error loading repositories')}
            emptyStateTitle={t('No repositories yet')}
            emptyStateDescription={t('To get started, create an repository.')}
            emptyStateButtonText={t('Add repository')}
            emptyStateButtonClick={() => navigate(RouteE.CreateRepository)}
            {...view}
        />
    )
}

export function useRemoteRepositoriesColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const tableColumns = useMemo<ITableColumn<RemoteRepository>[]>(
        () => [
            { header: 'Name', cell: (repository) => <TextCell text={repository.name} /> },
            { header: 'Sync status', cell: (repository) => <TextCell text={repository.last_sync_task.state} /> },
            { header: 'Last sync', cell: (repository) => <SinceCell value={repository.last_sync_task.finished_at} /> },
            { header: 'Last modified', cell: (repository) => <SinceCell value={repository.updated_at} /> },
            { header: 'Created', cell: (repository) => <SinceCell value={repository.created_at} /> },
        ],
        []
    )
    return tableColumns
}
