import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../../framework'
import { useNameColumn } from '../../../../common/columns'
import { getItemKey, requestDelete } from '../../../../Data'
import { Organization } from '../../../interfaces/Organization'
import { useOrganizationsColumns } from '../Organizations'

export function useDeleteOrganizations(onComplete: (organizations: Organization[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useOrganizationsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const bulkAction = useBulkConfirmation<Organization>()
  const deleteOrganizations = (organizations: Organization[]) => {
    bulkAction({
      title:
        organizations.length === 1
          ? t('Permanently delete organization')
          : t('Permanently delete organizations'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} organizations.', {
        count: organizations.length,
      }),
      actionButtonText: t('Delete organization', { count: organizations.length }),
      items: organizations.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (organization: Organization) =>
        requestDelete(`/api/v2/organizations/${organization.id}/`),
    })
  }
  return deleteOrganizations
}
