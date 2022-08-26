import { CheckCircleIcon, ExclamationCircleIcon, RunningIcon } from '@patternfly/react-icons'
import { Fragment, Suspense, useMemo } from 'react'
import {
    getPatternflyColor,
    ITableColumn,
    ItemView,
    LoadingTable,
    PageHeader,
    PatternFlyColor,
    SinceCell,
    TextCell,
} from '../../../framework'
import { useTranslation } from '../../../framework/components/useTranslation'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { compareNumbers, compareStrings } from '../../common/compare'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { RouteE } from '../../route'
// import { UserName } from '../access/users/Users'
import { Template } from '../resources/Templates'

export interface IJob extends IItem {
    type: 'job' | 'project_update' | 'inventory_update' | 'system_job' | 'workflow_job' | null
    name: string
    finished?: string | null
    failed?: boolean
    started?: string | null
    status?: 'successful' | 'failed' | 'running' | null
    launched_by: {
        id: number
    }
    workflow_job_template?: number
}

export function useJobs() {
    const { items: jobs } = useItems<IJob>('unified_jobs')
    return jobs
}

export default function JobsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Jobs') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('Jobs')} breadcrumbs={breadcrumbs} />
            <Suspense fallback={<LoadingTable toolbar />}>
                <Jobs />
            </Suspense>
        </Fragment>
    )
}

export function Jobs() {
    const jobs = useJobs()
    return <JobsTable jobs={jobs} />
}

export function JobsTable(props: { jobs: IJob[] }) {
    const { jobs } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<IJob>[] = useMemo(() => {
        const newColumns: ITableColumn<IJob>[] = [
            {
                header: t('ID'),
                cell: (item) => {
                    return <TextCell text={item.id} />
                },
                sortFn: (l, r) => compareNumbers(l.id, r.id),
            },
            nameColumn,
            {
                header: t('Status'),
                cell: (item) => {
                    switch (item.status) {
                        case 'running':
                            return (
                                <TextCell
                                    text={t('Running')}
                                    icon={<RunningIcon color={getPatternflyColor(PatternFlyColor.Blue)} />}
                                    iconSize="sm"
                                />
                            )
                        case 'successful':
                            return (
                                <TextCell
                                    text={t('Successful')}
                                    icon={<CheckCircleIcon color={getPatternflyColor(PatternFlyColor.Green)} />}
                                    iconSize="sm"
                                />
                            )
                        case 'failed':
                            return (
                                <TextCell
                                    text={t('Failed')}
                                    icon={<ExclamationCircleIcon color={getPatternflyColor(PatternFlyColor.Red)} />}
                                    iconSize="sm"
                                />
                            )
                    }
                    return <TextCell text={item.status} />
                },
                sortFn: (l, r) => compareStrings(l.name, r.name),
            },
            {
                header: t('Type'),
                cell: (item) => {
                    switch (item.type) {
                        case 'inventory_update':
                            return <TextCell text={t('Inventory Update')} />
                        case 'job':
                            return <TextCell text={t('Job')} />
                        case 'project_update':
                            return <TextCell text={t('Project Update')} />
                        case 'system_job':
                            return <TextCell text={t('System Job')} />
                        case 'workflow_job':
                            return <TextCell text={t('Workflow Job')} />
                    }
                    return <TextCell text={item.type} />
                },
                sortFn: (l, r) => compareStrings(l.name, r.name),
            },
            {
                header: t('Start Time'),
                cell: (item) => {
                    return <SinceCell value={item.started} />
                },
                sortFn: (l, r) => compareStrings(l.started, r.started),
            },
            {
                header: t('Finished Time'),
                cell: (item) => {
                    return <SinceCell value={item.finished} />
                },
                sortFn: (l, r) => compareStrings(l.finished, r.finished),
            },
            {
                header: t('Launched By'),
                cell: (item) => {
                    return <div />
                },
            },
            {
                header: t('Template'),
                cell: (item) => {
                    return <Template id={item.workflow_job_template} />
                },
            },
            createdColumn,
            modifiedColumn,
        ]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn, t])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={jobs}
            itemKeyFn={getItemKey}
            singular={t('job')}
            plural={t('jobs')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
