import { ButtonVariant } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    TablePage,
    TypedActionType,
} from '../../../../framework'
import {
    useCreatedColumn,
    useDescriptionColumn,
    useModifiedColumn,
    useNameColumn,
    useOrganizationNameColumn,
} from '../../../common/columns'
import { StatusCell } from '../../../common/StatusCell'
import { RouteE } from '../../../Routes'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { Project } from './Project'
import { useDeleteProjects } from './useDeleteProjects'

export function Projects() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const toolbarFilters = useProjectsFilters()
    const tableColumns = useProjectsColumns()
    const view = useControllerView<Project>({
        url: '/api/v2/projects/',
        toolbarFilters,
        tableColumns,
    })
    const deleteProjects = useDeleteProjects((deleted: Project[]) => {
        for (const project of deleted) {
            view.unselectItem(project)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Project>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create project'),
                onClick: () => navigate(RouteE.CreateProject),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected projects'),
                onClick: deleteProjects,
            },
        ],
        [navigate, deleteProjects, t]
    )

    const rowActions = useMemo<IItemAction<Project>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit project'),
                onClick: (project) =>
                    navigate(RouteE.EditProject.replace(':id', project.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete project'),
                onClick: (project) => deleteProjects([project]),
            },
        ],
        [navigate, deleteProjects, t]
    )

    return (
        <TablePage<Project>
            title={t('Projects')}
            titleHelpTitle={t('Projects')}
            titleHelp={t('projects.title.help')}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/projects.html"
            description={t('projects.title.description')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading projects')}
            emptyStateTitle={t('No projects yet')}
            emptyStateDescription={t('To get started, create an project.')}
            emptyStateButtonText={t('Create project')}
            emptyStateButtonClick={() => navigate(RouteE.CreateProject)}
            {...view}
        />
    )
}

export function useProjectsFilters() {
    const { t } = useTranslation()
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            nameToolbarFilter,
            descriptionToolbarFilter,
            {
                key: 'type',
                label: t('Type'),
                type: 'select',
                query: 'scm_type',
                options: [
                    { label: t('Manual'), value: 'manual' },
                    { label: t('Git'), value: 'git' },
                    { label: t('Subversion'), value: 'subversion' },
                    { label: t('Remote archive'), value: 'remote' },
                    { label: t('Red Hat insights'), value: 'insights' },
                ],
                placeholder: t('Select types'),
            },
            createdByToolbarFilter,
            modifiedByToolbarFilter,
        ],
        [
            nameToolbarFilter,
            descriptionToolbarFilter,
            t,
            createdByToolbarFilter,
            modifiedByToolbarFilter,
        ]
    )
    return toolbarFilters
}

export function useProjectsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const nameClick = useCallback(
        (project: Project) => navigate(RouteE.ProjectDetails.replace(':id', project.id.toString())),
        [navigate]
    )
    const nameColumn = useNameColumn({ ...options, onClick: nameClick })
    const descriptionColumn = useDescriptionColumn()
    const organizationColumn = useOrganizationNameColumn(options)
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Project>[]>(
        () => [
            nameColumn,
            descriptionColumn,
            {
                header: t('Status'),
                cell: (project) => <StatusCell status={project.status} />,
            },
            {
                header: t('Type'),
                cell: (project) => project.scm_type,
            },
            {
                header: t('Revision'),
                cell: (project) => project.scm_revision,
            },
            organizationColumn,
            createdColumn,
            modifiedColumn,
        ],
        [nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
    )
    return tableColumns
}
