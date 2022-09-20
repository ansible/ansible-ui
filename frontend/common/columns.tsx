import { useMemo } from 'react'
import { ITableColumn, SinceCell, TextCell } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../route'

export function useNameColumn<T extends { name: string; id: number }>(options: {
    url?: string
    onClick?: (item: T) => void
    disableSort?: boolean
}) {
    const { t } = useTranslation()
    const column = useMemo<ITableColumn<T>>(
        () => ({
            header: t('Name'),
            cell: (item: T) => (
                <TextCell
                    text={item.name}
                    iconSize="sm"
                    to={options.url?.replace(':id', item.id.toString())}
                    onClick={options.onClick ? () => options.onClick?.(item) : undefined}
                />
            ),
            sort: options.disableSort ? undefined : 'name',
        }),
        [options, t]
    )
    return column
}

export function useCreatedColumn(options?: { disableSort?: boolean }) {
    const { t } = useTranslation()
    const column: ITableColumn<{ created?: string }> = {
        header: t('Created'),
        cell: (item) => {
            if (!item.created) return <></>
            return <SinceCell value={item.created} />
        },
        sort: options?.disableSort ? undefined : 'created',
        defaultSortDirection: 'desc',
    }
    return column
}

export function useModifiedColumn(options?: { disableSort?: boolean }) {
    const { t } = useTranslation()
    const column: ITableColumn<{ modified?: string }> = {
        header: t('Modified'),
        cell: (item) => {
            if (!item.modified) return <></>
            return <SinceCell value={item.modified} />
        },
        sort: options?.disableSort ? undefined : 'modified',
        defaultSortDirection: 'desc',
    }
    return column
}

export function useOrganizationNameColumn(options?: { disableLink?: boolean; disableSort?: boolean }) {
    const { t } = useTranslation()
    const column: ITableColumn<{
        summary_fields?: {
            organization?: {
                id: number
                name: string
            }
        }
    }> = {
        header: t('Organization'),
        cell: (item) => (
            <TextCell
                text={item.summary_fields?.organization?.name}
                to={
                    options?.disableLink
                        ? undefined
                        : RouteE.OrganizationDetails.replace(':id', (item.summary_fields?.organization?.id ?? '').toString())
                }
            />
        ),
        sort: options?.disableSort ? undefined : 'organization',
    }
    return column
}
