import { Modal, ModalVariant, Skeleton } from '@patternfly/react-core'
import { Collapse } from '../../framework'
import { PageTable } from '../../framework/PageTable'
import { getItemKey } from '../Data'
import { Organization } from './access/organizations/Organization'
import { useOrganizationsColumns, useOrganizationsFilters } from './access/organizations/Organizations'
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
