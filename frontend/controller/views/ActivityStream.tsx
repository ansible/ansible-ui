import { Fragment, Suspense, useMemo } from 'react'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../../framework'
import { useTranslation } from '../../../framework/components/useTranslation'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IActivityStream extends IItem {
    type: 'activity_stream'
    name: string
}

export function useActiviyStreams() {
    const { items: activityStreams } = useItems<IActivityStream>('activity_stream')
    return activityStreams
}

export default function ActiviyStreamsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Activiy Stream') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('Activity Stream')} breadcrumbs={breadcrumbs} />
            <Suspense fallback={<LoadingTable toolbar />}>
                <ActiviyStreams />
            </Suspense>
        </Fragment>
    )
}

export function ActiviyStreams() {
    const activityStreams = useActiviyStreams()
    return <ActiviyStreamsTable activityStreams={activityStreams} />
}

export function ActiviyStreamsTable(props: { activityStreams: IActivityStream[] }) {
    const { activityStreams } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<IActivityStream>[] = useMemo(() => {
        const newColumns: ITableColumn<IActivityStream>[] = [nameColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={activityStreams}
            itemKeyFn={getItemKey}
            singular={t('job')}
            plural={t('activityStreams')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
