import { Skeleton } from '@patternfly/react-core'
import { CopyIcon, EditIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons'
import { Type } from '@sinclair/typebox'
import { Fragment, Suspense, useMemo } from 'react'
import useSWR from 'swr'
import {
    useCreatedColumn,
    useModifiedColumn,
    useNameColumn,
    useOrganizationNameColumn,
    useScmRevisionColumn,
    useScmTypeColumn,
    useStatusColumn,
} from '../../common/columns'
import { useCreateToolbarAction, useDeleteToolbarAction, useSyncToolbarAction } from '../../common/toolbar-actions'
import { fetchOptions, getItemKey, IItem, useItem, useItems } from '../../Data'
import { IItemAction, ITableColumn, ItemView, IToolbarAction, LoadingTable, PageHeader, SinceCell, TextCell } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { PageContent } from '../../framework/PageContent'
import { RouteE } from '../../route'

export interface Project extends IItem {
    type: 'project'
    name: string
    description: string
    status: string
    scm_type: string
    scm_revision: string
    last_job_run: string
    last_updated: string
    scm_url: string
    scm_branch: string
    scm_update_cache_timeout: number
    local_path: string
    organization?: number
}

export const ProjectType = Type.Object({
    id: Type.Number(),
    url: Type.String(),
    modified: Type.String(),
    created: Type.String(),
    type: Type.Literal('project'),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    status: Type.String(),
    scm_type: Type.String(),
    scm_revision: Type.String(),
    last_job_run: Type.String(),
    last_updated: Type.String(),
    scm_url: Type.String(),
    scm_branch: Type.String(),
    scm_update_cache_timeout: Type.Number(),
    local_path: Type.String(),
    organization: Type.Optional(Type.Number()),
    scm_refspec: Type.String(),
    scm_clean: Type.Boolean(),
    scm_delete_on_update: Type.Boolean(),
    scm_track_submodules: Type.Boolean(),
    scm_update_on_launch: Type.Boolean(),
    allow_override: Type.Boolean(),
})

// false
// created: "2022-07-29T19:44:01.438189Z"
// credential: null
// custom_virtualenv: null
// default_environment: null
// description: ""
// id: 134
// last_job_failed: true
// last_job_run: "2022-07-29T19:44:22.295629Z"
// last_update_failed: true
// last_updated: "2022-07-29T19:44:22.295629Z"
// local_path: "_134__demo_project_0344_pm"
// modified: "2022-07-29T19:44:14.540332Z"
// name: "Demo Project @ 03:44 PM"
// next_job_run: null
// organization: 1
// related: {created_by: "/api/v2/users/2/", modified_by: "/api/v2/users/2/",…}
// scm_branch: ""
// scm_clean: false
// scm_delete_on_update: false
// scm_refspec: ""
// scm_revision: "347e44fea036c94d5f60e544de006453ee5c71ad"
// scm_track_submodules: false
// scm_type: "git"
// scm_update_cache_timeout: 0
// scm_update_on_launch: true
// scm_url: "https://github.com/ansible/ansible-tower-xxx"
// status: "failed"
// summary_fields: {organization: {id: 1, name: "Default", description: ""},…}
// timeout: 0
// type: "project"
// url: "/api/v2/projects/134/"

export function useProjects() {
    const { items: projects } = useItems<Project>('projects')
    return projects
}

export function useProject(id: number) {
    const projects = useProjects()
    return projects.find((project) => project.id === id)
}

export function ProjectName(props: { id?: number }) {
    return (
        <Suspense fallback={<Skeleton width="120px" />}>
            <ProjectNameInternal id={props.id} />
        </Suspense>
    )
}

export function ProjectNameInternal(props: { id?: number }) {
    const project = useItem<Project>(props.id, 'projects')
    if (!project) return <></>
    return <TextCell text={project.name} to={`/projects/${props.id}/details`} />
}

export function useProjectNameColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ project?: number }> = {
        header: t('Project'),
        cell: (item) => {
            return <ProjectName id={item.project} />
        },
        // sortFn: (l, r) => compareStrings(l.modified, r.modified),
    }
    return column
}

export default function ProjectsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Projects') }], [t])
    return (
        <Fragment>
            <PageHeader
                title={t('Projects')}
                breadcrumbs={breadcrumbs}
                description={t('A project is a logical collection of Ansible playbooks, represented in Tower.')}
                titleHelp={t(
                    'You can manage playbooks and playbook directories by either placing them manually under the Project Base Path on your Tower server, or by placing your playbooks into a source code management (SCM) system supported by Tower, including Git, Subversion, Mercurial, and Red Hat Insights.'
                )}
            />
            <Suspense fallback={<LoadingTable toolbar padding />}>
                <Projects />
            </Suspense>
        </Fragment>
    )
}

export function Projects() {
    const { t } = useTranslation()

    const projects = useProjects()

    const projectsOptions = useSWR<{ actions: { GET: Record<string, { type: string; label: 'string'; filterable: boolean }> } }>(
        '/api/v2/projects/',
        fetchOptions
    )

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    // const statusFilter = useMemo<IItemFilter<Project>>(
    //     () => ({
    //         label: t('Status'),
    //         options: [
    //             { label: t('Successful'), value: 'successful' },
    //             { label: t('Failed'), value: 'failed' },
    //         ],
    //         filter: (item: Project, values: string[]) => values.includes(item.status),
    //     }),
    //     [t]
    // )
    // const typeFilter = useMemo<IItemFilter<Project>>(
    //     () => ({
    //         label: t('Type'),
    //         options: [{ label: t('Git'), value: 'git' }],
    //         filter: (item: Project, values: string[]) => {
    //             // TODO values as Record<string,boolean> for performance
    //             for (const value of values) {
    //                 if (item.scm_type === value) {
    //                     return true
    //                 }
    //             }
    //             return false
    //         },
    //     }),
    //     [t]
    // )

    // const filtersold = useMemo(() => [statusFilter, typeFilter], [statusFilter, typeFilter])
    const filters = useMemo(() => {
        const gets = projectsOptions.data?.actions.GET
        if (!gets) return []
        const filterKeys = Object.keys(gets).filter((key) => gets[key].filterable === true)
        return filterKeys.map((key) => {
            const value = gets[key]
            return {
                label: value.label,
                options: [{ label: value.label, value: 'git' }],
                type: value.label === 'Name' ? 'search' : undefined,
                filter: (item: Project, values: string[]) => {
                    // TODO values as Record<string,boolean> for performance
                    for (const value of values) {
                        if (item.scm_type === value) {
                            return true
                        }
                        ;``
                    }
                    return false
                },
            }
        })
    }, [projectsOptions])

    const createToolbalAction = useCreateToolbarAction()
    const deleteToolbalAction = useDeleteToolbarAction()
    const syncToolbalAction = useSyncToolbarAction()
    const toolbarActions: IToolbarAction<Project>[] = useMemo(
        () => [createToolbalAction, deleteToolbalAction, syncToolbalAction],
        [createToolbalAction, deleteToolbalAction, syncToolbalAction]
    )

    const nameColumn = useNameColumn()
    const statusColumn = useStatusColumn()
    const scmTypeColumn = useScmTypeColumn()
    const scmRevisionColumn = useScmRevisionColumn()
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<Project>[] = useMemo(() => {
        const newColumns: ITableColumn<Project>[] = [
            nameColumn,
            statusColumn,
            scmTypeColumn,
            scmRevisionColumn,
            organizationColumn,
            {
                header: t('Used'),
                cell: (task) => <SinceCell value={task.last_job_run} />,
                sortFn: (l, r) => l.last_job_run.localeCompare(r.last_job_run),
            },
            {
                header: t('Updated'),
                cell: (task) => <SinceCell value={task.last_updated} />,
                sortFn: (l, r) => l.last_updated.localeCompare(r.last_updated),
            },
            createdColumn,
            modifiedColumn,
        ]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn, organizationColumn, scmRevisionColumn, scmTypeColumn, statusColumn, t])

    const itemActions: IItemAction<Project>[] = useMemo(
        () => [
            { icon: SyncIcon, label: t('Sync'), onClick: () => null },
            { icon: EditIcon, label: t('Edit'), onClick: () => null },
            { icon: CopyIcon, label: t('Copy'), onClick: () => null },
            { icon: TrashIcon, label: t('Delete'), onClick: () => null },
        ],
        [t]
    )

    return (
        <PageContent padding>
            <ItemView<Project>
                items={projects}
                columns={columns}
                itemKeyFn={getItemKey}
                toolbarActions={toolbarActions}
                itemActions={itemActions}
                filters={filters}
                searchKeys={searchKeys}
                singular={t('project')}
                plural={t('projects')}
                article="a"
            />
        </PageContent>
    )
}
