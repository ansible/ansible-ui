import { Button, Modal, ModalVariant, Skeleton } from '@patternfly/react-core'
import { useMemo } from 'react'
import { Collapse } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { ITableColumn, PageTable, TextCell } from '../../framework/PageTable'
import { compareNumbers } from '../../framework/utils/compare'
import { useCreatedColumn, useModifiedColumn } from '../common/columns'
import { getItemKey } from '../Data'
import { RouteE } from '../route'
import { Organization } from './access/organizations/Organization'
import { useOrganizationsFilters } from './access/organizations/Organizations'
import { useControllerView } from './useControllerView'

export function SelectDialog(props: { open: boolean; setOpen: (open: boolean) => void; onClick: (item: Organization) => void }) {
    const { open, setOpen, onClick } = props
    const onClose = () => setOpen(false)
    const toolbarFilters = useOrganizationsFilters()
    const tableColumns = useOrganizationsColumns((organization: Organization) => {
        setOpen(false)
        onClick(organization)
    })
    const view = useControllerView('/api/v2/organizations/', getItemKey, toolbarFilters, tableColumns)
    return (
        <Modal title="Select an organization" isOpen={open} onClose={onClose} variant={ModalVariant.medium} tabIndex={0}>
            <Collapse open={view.itemCount === undefined}>
                <Skeleton height="80px"></Skeleton>
            </Collapse>

            <Collapse open={view.itemCount !== undefined}>
                <div
                    style={{
                        marginLeft: -16,
                        marginRight: -16,
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 400,
                        overflow: 'hidden',
                    }}
                >
                    <PageTable tableColumns={tableColumns} toolbarFilters={toolbarFilters} {...view} />
                </div>
            </Collapse>
        </Modal>
    )
}

export function useNameColumn<T extends { name: string; id: number }>(options: {
    url?: string
    onClick?: (item: T) => void
    disableSort?: boolean
}) {
    const { t } = useTranslation()
    const column: ITableColumn<{ name: string; id: number }> = {
        header: t('Organization'),
        cell: (item: T) => (
            <Button onClick={options.onClick ? () => options.onClick(item) : undefined} style={{ width: '100%' }}>
                {item.name}
            </Button>
            // <TextCell
            //     text={item.name}
            //     iconSize="sm"
            //     to={options.url?.replace(':id', item.id.toString())}
            //     onClick={options.onClick ? () => options.onClick(item) : undefined}
            // />
        ),
        sort: options.disableSort ? undefined : 'name',
    }
    return column
}

export function useOrganizationsColumns(onClick?: (organization: Organization) => void) {
    const { t } = useTranslation()
    const nameColumn = useNameColumn(onClick ? { onClick } : { url: RouteE.OrganizationDetails })
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<Organization>[]>(
        () => [
            nameColumn,
            {
                header: t('Members'),
                cell: (organization) => <TextCell text={organization.summary_fields.related_field_counts.users.toString()} />,
                sortFn: (l, r) => compareNumbers(l.summary_fields.related_field_counts.users, r.summary_fields.related_field_counts.users),
            },
            {
                header: t('Teams'),
                cell: (organization) => <TextCell text={organization.summary_fields.related_field_counts.teams.toString()} />,
                sortFn: (l, r) => compareNumbers(l.summary_fields.related_field_counts.teams, r.summary_fields.related_field_counts.teams),
            },
            createdColumn,
            modifiedColumn,
        ],
        [createdColumn, modifiedColumn, nameColumn, t]
    )
    return tableColumns
}
