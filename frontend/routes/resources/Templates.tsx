import { Skeleton } from '@patternfly/react-core'
import { Fragment, Suspense, useMemo } from 'react'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItem, useItems } from '../../Data'
import { ITableColumn, ItemView, LoadingTable, PageHeader, TextCell } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../../route'
import { useInventoryNameColumn } from './Inventories'
import { useProjectNameColumn } from './Projects'

export interface Template extends IItem {
    type: 'project' | 'inventory_source' | 'job_template' | 'system_job_template' | 'workflow_job_template'
    name: string
    organization?: number
    inventory?: number
    project?: number
    inventory_sources_with_failures: number
}

export function useTemplates() {
    const { items: templates } = useItems<Template>('unified_job_templates')
    return templates
}

export function Template(props: { id?: number }) {
    return (
        <Suspense fallback={<Skeleton width="120px" />}>
            <TemplateInternal id={props.id} />
        </Suspense>
    )
}

export function TemplateInternal(props: { id?: number }) {
    const template = useItem<Template>(props.id, 'unified_job_templates')
    if (!template) return <></>
    return <TextCell text={template.name} to={`/templates/${props.id}`} />
}

export default function TemplatesPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Templates') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('Templates')} breadcrumbs={breadcrumbs} />
            <Templates />
        </Fragment>
    )
}

export function Templates(props: { projectID?: number }) {
    return (
        <Suspense fallback={<LoadingTable toolbar />}>
            <TemplatesInternal projectID={props.projectID} />
        </Suspense>
    )
}

export function TemplatesInternal(props: { projectID?: number }) {
    const templates = useTemplates()
    const filteredTemplates = useMemo(
        () =>
            templates.filter((template) => {
                if (props.projectID !== undefined) {
                    if (template.project !== props.projectID) return false
                }
                return true
            }),
        [props.projectID, templates]
    )
    return <TemplatesTable templates={filteredTemplates} />
}

export function TemplatesTable(props: { templates: Template[] }) {
    const { templates } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const organizationColumn = useOrganizationNameColumn()
    const inventoryColumn = useInventoryNameColumn()
    const projectColumn = useProjectNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<Template>[] = useMemo(() => {
        const newColumns: ITableColumn<Template>[] = [
            nameColumn,
            {
                header: 'Type',
                cell: (item) => {
                    switch (item.type) {
                        case 'inventory_source':
                            return <TextCell text={t('Inventory Source')} />
                        case 'job_template':
                            return <TextCell text={t('Job Template')} />
                        case 'project':
                            return <TextCell text={t('Project')} />
                        case 'system_job_template':
                            return <TextCell text={t('System Job Template')} />
                        case 'workflow_job_template':
                            return <TextCell text={t('Workflow Job Template')} />
                    }
                },
                sortFn: (l, r) => l.name.localeCompare(r.name),
            },
            organizationColumn,
            inventoryColumn,
            projectColumn,
            createdColumn,
            modifiedColumn,
        ]
        return newColumns
    }, [createdColumn, inventoryColumn, modifiedColumn, nameColumn, organizationColumn, projectColumn, t])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={templates}
            itemKeyFn={getItemKey}
            singular={t('template')}
            plural={t('templates')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
