import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, useSetDialog } from '../../../../framework'
import { compareStrings } from '../../../../framework/utils/compare'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Organization } from './Organization'
import { useOrganizationsColumns } from './Organizations'

export function useDeleteOrganizations(callback: (organizations: Organization[]) => void) {
    const { t } = useTranslation()
    const setDialog = useSetDialog()
    const columns = useOrganizationsColumns({ disableLinks: true, disableSort: true })
    const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
    const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteOrganizations = (items: Organization[]) => {
        setDialog(
            <BulkActionDialog<Organization>
                title={t('Permanently delete organizations', { count: items.length })}
                confirm={t('Yes, I confirm that I want to delete these {{count}} organizations.', { count: items.length })}
                submit={t('Delete organizations', { count: items.length })}
                submitting={t('Deleting organizations', { count: items.length })}
                submittingTitle={t('Deleting {{count}} organizations', { count: items.length })}
                pending={t('Pending')}
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
