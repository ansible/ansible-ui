import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TypedActionType } from '../../../../framework'
import { useCreatedColumn, useDescriptionColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../Routes'
import { useControllerView } from '../../useControllerView'
import { Host } from './Host'
import { useDeleteHosts } from './useDeleteHosts'

export function Hosts() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useHostsFilters()
    const tableColumns = useHostsColumns()
    const view = useControllerView<Host>('/api/v2/hosts/', toolbarFilters, tableColumns)
    const deleteHosts = useDeleteHosts((deleted: Host[]) => {
        for (const host of deleted) {
            view.unselectItem(host)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Host>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create host'),
                onClick: () => navigate(RouteE.CreateHost),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected hosts'),
                onClick: deleteHosts,
            },
        ],
        [navigate, deleteHosts, t]
    )

    const rowActions = useMemo<IItemAction<Host>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit host'),
                onClick: (host) => navigate(RouteE.EditHost.replace(':id', host.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete host'),
                onClick: (host) => deleteHosts([host]),
            },
        ],
        [navigate, deleteHosts, t]
    )

    return (
        <TablePage<Host>
            title={t('Hosts')}
            titleHelpTitle={t('Hosts')}
            titleHelp={t('hosts.title.help')}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/hosts.html"
            description={t('hosts.title.description')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading hosts')}
            emptyStateTitle={t('No hosts yet')}
            emptyStateDescription={t('To get started, create an host.')}
            emptyStateButtonText={t('Create host')}
            emptyStateButtonClick={() => navigate(RouteE.CreateHost)}
            {...view}
        />
    )
}

export function useHostsFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useHostsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const navigate = useNavigate()
    const nameClick = useCallback((host: Host) => navigate(RouteE.HostDetails.replace(':id', host.id.toString())), [navigate])
    const nameColumn = useNameColumn({
        ...options,
        onClick: nameClick,
    })
    const descriptionColumn = useDescriptionColumn()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Host>[]>(
        () => [nameColumn, descriptionColumn, createdColumn, modifiedColumn],
        [nameColumn, descriptionColumn, createdColumn, modifiedColumn]
    )
    return tableColumns
}
