import { useMemo } from 'react'
import { BulkActionDialog, useSetDialog } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { compareStrings } from '../../../../framework/utils/compare'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Organization } from './Organization'
import { useOrganizationsColumns } from './Organizations'

export function useDeleteOrganizations(callback: (organizations: Organization[]) => void) {
    const { t } = useTranslation()
    const setDialog = useSetDialog()
    const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
    const columns = useOrganizationsColumns({ disableLinks: true, disableSort: true })
    const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteOrganizations = (items: Organization[]) => {
        setDialog(
            <BulkActionDialog<Organization>
                title={t('Permanently delete organizations', { count: items.length })}
                confirm={t('Yes, I confirm that I want to delete these {{count}} organizations.', { count: items.length })}
                submit={t('Delete')}
                submitting={t('Deleting')}
                submittingTitle={t('Deleting {{count}} organizations', { count: items.length })}
                success={t('Success')}
                cancel={t('Cancel')}
                close={t('Close')}
                error={t('There were errors deleting organizations', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(organization: Organization) => requestDelete(`/api/v2/organizations/${organization.id}/`)}
            />
        )
    }
    return deleteOrganizations
}
