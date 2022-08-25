import { PageSection } from '@patternfly/react-core'
import { CopyIcon, EditIcon, SyncIcon, TrashIcon } from '@patternfly/react-icons'
import { Fragment, Suspense, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
    CopyCell,
    Detail,
    DetailsList,
    ICatalogBreadcrumb,
    IItemAction,
    PageHeader,
    SinceCell,
    TextCell,
    ThemeE,
    useTheme,
} from '../../../framework'
import { LoadingPage } from '../../../framework/components/LoadingPage'
import { Scrollable } from '../../../framework/components/Scrollable'
import { useTranslation } from '../../../framework/components/useTranslation'
import { PageContent } from '../../../framework/PageContent'
import { PageTab, PageTabs } from '../../../framework/PageTabs'
import { DetailActions } from '../../common/DetailActions'
import { getScmType } from '../../common/scm'
import { getStatus } from '../../common/status'
import { RouteE } from '../../route'
// import { Users } from '../access/users/Users'
import { Notifications } from '../administration/Notifications'
import { Schedules } from '../views/Schedules'
import { Project, useProject } from './Projects'
import { Templates } from './Templates'

export function ProjectsDetailsPage() {
    const { t } = useTranslation()
    const baseBreadcrumbs = [
        { label: t('Dashboard'), to: RouteE.Dashboard },
        { label: t('Projects'), to: RouteE.Projects },
    ]
    return (
        <Suspense fallback={<LoadingPage breadcrumbs={baseBreadcrumbs} />}>
            <ProjectsDetailsContent baseBreadcrumbs={baseBreadcrumbs} />
        </Suspense>
    )
}

export function ProjectsDetailsContent(props: { baseBreadcrumbs: ICatalogBreadcrumb[] }) {
    const { t } = useTranslation()
    const params = useParams<{ id: string }>()
    const id = Number(params.id)
    const project = useProject(id)

    const [activeKey, setActiveKey] = useState<string | number>('details')

    const breadcrumbs = [...props.baseBreadcrumbs, { label: project?.name ?? '' }]

    const history = useHistory()

    const itemActions: IItemAction<Project>[] = useMemo(
        () => [
            { icon: SyncIcon, label: t('Sync'), onClick: () => null },
            {
                icon: EditIcon,
                label: t('Edit'),
                onClick: () => history.push(RouteE.ProjectEdit.replace(':id', project?.id.toString() ?? '')),
            },
            { icon: CopyIcon, label: t('Copy'), onClick: () => null },
            { icon: TrashIcon, label: t('Delete'), onClick: () => null },
        ],
        [history, project, t]
    )

    if (!project) return <></>

    return (
        <Fragment>
            <PageHeader
                title={project.name}
                breadcrumbs={breadcrumbs}
                pageActions={<DetailActions item={project} actions={itemActions} />}
            />
            <PageContent padding={true}>
                <PageTabs activeKey={activeKey} setActiveKey={setActiveKey}>
                    <PageTab title={t('Details')}>
                        <ProjectDetails id={project.id} />
                    </PageTab>
                    <PageTab title={t('Access')}>
                        <ProjectAccess />
                    </PageTab>
                    <PageTab title={t('Job Templates')}>
                        <ProjectJobTemplates projectID={project.id} />
                    </PageTab>
                    <PageTab title={t('Notifications')}>
                        <ProjectNotifications />
                    </PageTab>
                    <PageTab title={t('Schedules')}>
                        <ProjectSchedules />
                    </PageTab>
                </PageTabs>
            </PageContent>
        </Fragment>
    )
}

export function ProjectDetails(props: { id: number }) {
    const project = useProject(props.id)
    const { t } = useTranslation()
    const [theme] = useTheme()

    if (!project) return <></>
    return (
        <Scrollable>
            <PageSection variant={theme === ThemeE.Dark ? undefined : 'light'}>
                <DetailsList>
                    <Detail label={t('Name')}>{project.name}</Detail>
                    <Detail label={t('Description')}>{project.description}</Detail>
                    {/* <Detail label={t('Organization')}>
                        <OrganizationName id={project.organization} />
                    </Detail> */}
                    <Detail label={t('Last job status')}>
                        <TextCell {...getStatus(project)} iconSize="sm" />
                    </Detail>
                    <Detail label={t('Source control type')}>
                        <TextCell {...getScmType(project)} iconSize="md" />
                    </Detail>
                    <Detail label={t('Source control revision')}>
                        <CopyCell text={project.scm_revision} />
                    </Detail>
                    <Detail label={t('Source control URL')}>
                        <TextCell text={project.scm_url} to={project.scm_url} />
                    </Detail>
                    <Detail label={t('Source control branch')}>{project.scm_branch}</Detail>
                    <Detail label={t('Cache timeout')}>{project.scm_update_cache_timeout.toString()}</Detail>
                    <Detail label={t('Playbook directory')}>{project.local_path}</Detail>
                    <Detail label={t('Created')}>
                        <SinceCell value={project.created} />
                    </Detail>
                    <Detail label={t('Last modified')}>
                        <SinceCell value={project.modified} />
                    </Detail>
                </DetailsList>
            </PageSection>
        </Scrollable>
    )
}

export function ProjectAccess() {
    return <div />
}

export function ProjectJobTemplates(props: { projectID: number }) {
    return <Templates projectID={props.projectID} />
}

export function ProjectNotifications() {
    return <Notifications />
}

export function ProjectSchedules() {
    return <Schedules />
}
