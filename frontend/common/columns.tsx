import { Switch } from '@patternfly/react-core'
import { CopyCell, ITableColumn, SinceCell, TextCell } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../route'
import { compareStrings, compareUnknowns } from './compare'
import { getScmType } from './scm'
import { getStatus } from './status'

export function useNameColumn<T extends { name: string; id: number }>(options: { url?: string; onClick?: (item: T) => void }) {
    const { t } = useTranslation()
    const column: ITableColumn<{ name: string; id: number }> = {
        header: t('Name'),
        cell: (item: T) => (
            <TextCell
                text={item.name}
                iconSize="sm"
                to={options.url?.replace(':id', item.id.toString())}
                onClick={() => options.onClick(item)}
            />
        ),
        sort: 'name',
    }
    return column
}

export const nameColumn: ITableColumn<{ name: string; url?: string }> = {
    header: 'Name',
    cell: (item) => {
        return <TextCell text={item.name} iconSize="sm" to={item.url?.replace('/api/v2', '')} />
    },
    sort: 'name',
}

export function useStatusColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ status?: string }> = {
        header: t('Status'),
        cell: (item) => {
            const status = getStatus(item)
            if (!status) return <></>
            return <TextCell icon={status.icon} text={status.text} iconSize="sm" />
        },
        sortFn: (l, r) => compareStrings(l.status, r.status),
    }
    return column
}

export const statusColumn: ITableColumn<{ status?: string }> = {
    header: 'Status',
    cell: (item) => {
        const status = getStatus(item)
        if (!status) return <></>
        return (
            <TextCell
                icon={status.icon}
                text={status.text}
                iconSize="sm"
                // textColor={PatternFlyColor.Green}
            />
        )
    },
    sortFn: (l, r) => compareStrings(l.status, r.status),
}

export function useScmTypeColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ scm_type: string }> = {
        header: t('Type'),
        cell: (item) => {
            const scmType = getScmType(item)
            if (!scmType) return <></>
            return <TextCell icon={scmType.icon} text={scmType.text} iconSize="md" />
        },
        sortFn: (l, r) => compareStrings(l.scm_type, r.scm_type),
    }
    return column
}

export const scmTypeColumn: ITableColumn<{ scm_type: string }> = {
    header: 'Type',
    cell: (item) => {
        const scmType = getScmType(item)
        if (!scmType) return <></>
        return <TextCell icon={scmType.icon} text={scmType.text} iconSize="md" />
    },
    sortFn: (l, r) => compareStrings(l.scm_type, r.scm_type),
}

export function useScmRevisionColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ scm_revision?: string }> = {
        header: t('Revision'),
        cell: (item) => {
            if (!item.scm_revision) return <></>
            return <CopyCell text={item.scm_revision} minWidth={60} />
        },
        sortFn: (l, r) => compareStrings(l.scm_revision, r.scm_revision),
    }
    return column
}

export const scmRevisionColumn: ITableColumn<{ scm_revision?: string }> = {
    header: 'Revision',
    cell: (item) => {
        if (!item.scm_revision) return <></>
        return <CopyCell text={item.scm_revision} minWidth={60} />
    },
    sortFn: (l, r) => compareStrings(l.scm_revision, r.scm_revision),
}

export function useCreatedColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ created?: string }> = {
        header: t('Created'),
        cell: (item) => {
            if (!item.created) return <></>
            return <SinceCell value={item.created} />
        },
        sort: 'created',
        defaultSortDirection: 'desc',
    }
    return column
}

export const createdColumn: ITableColumn<{ created?: string }> = {
    header: 'Created',
    cell: (item) => {
        if (!item.created) return <></>
        return <SinceCell value={item.created} />
    },
    sortFn: (l, r) => compareStrings(l.created, r.created),
}

export function useModifiedColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ modified?: string }> = {
        header: t('Modified'),
        cell: (item) => {
            if (!item.modified) return <></>
            return <SinceCell value={item.modified} />
        },
        sort: 'modified',
        defaultSortDirection: 'desc',
    }
    return column
}

export const modifiedColumn: ITableColumn<{ modified?: string }> = {
    header: 'Last Modified',
    cell: (item) => {
        if (!item.modified) return <></>
        return <SinceCell value={item.modified} />
    },
    sortFn: (l, r) => compareStrings(l.modified, r.modified),
}

export const nextRunColumn: ITableColumn<{ next_run?: string }> = {
    header: 'Next Run',
    cell: (item) => {
        if (!item.next_run) return <></>
        return <SinceCell value={item.next_run} />
    },
    sortFn: (l, r) => compareStrings(l.next_run, r.next_run),
}

export function useEnabledColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ enabled?: boolean }> = {
        header: t('Enabled'),
        cell: (item) => {
            if (item.enabled === false) return <Switch labelOff={t('Disabled')} />
            if (item.enabled === true) return <Switch isChecked label={t('Enabled')} />
            return <></>
        },
        sortFn: (l, r) => compareUnknowns(l.enabled, r.enabled),
    }
    return column
}

export const enabledColumn: ITableColumn<{ enabled?: boolean }> = {
    header: 'Enabled',
    cell: (item) => {
        if (item.enabled === false) return <Switch labelOff="Off" />
        if (item.enabled === true) return <Switch isChecked label="On" />
        return <></>
    },
    sortFn: (l, r) => compareUnknowns(l.enabled, r.enabled),
}

export const summaryOrganizationColumn: ITableColumn<{
    summary_fields: {
        organization: ISummaryOrganization
    }
}> = {
    header: 'Organization',
    cell: (item) => {
        if (!item.summary_fields?.organization?.name) return <></>
        return (
            <TextCell
                text={item.summary_fields.organization.name}
                to={`/organizations/${item.summary_fields.organization.id.toString()}`}
            />
        )
    },
    sortFn: (l, r) => compareStrings(l.summary_fields.organization.name, r.summary_fields.organization.name),
}

export function useOrganizationNameColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{
        summary_fields: {
            organization: {
                id: number
                name: string
            }
        }
    }> = {
        header: t('Organization'),
        cell: (item) => (
            <TextCell
                text={item.summary_fields.organization.name}
                to={RouteE.OrganizationDetails.replace(':id', item.summary_fields.organization.id.toString())}
            />
        ),
        sort: 'organization',
    }
    return column
}
