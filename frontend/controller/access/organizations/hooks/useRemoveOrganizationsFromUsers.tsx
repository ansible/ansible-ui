import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../../interfaces/Organization'
import { User } from '../../../interfaces/User'

export function useRemoveOrganizationsFromUsers() {
  const { t } = useTranslation()
  const organizationProgressDialog = useBulkProgressDialog<Organization>()
  const removeUserToOrganizations = useCallback(
    (
      users: User[],
      organizations: Organization[],
      onClose?: (organizations: Organization[]) => void
    ) => {
      organizationProgressDialog({
        title: t('Removing user from organizations', {
          count: organizations.length,
        }),
        keyFn: (organization: Organization) => organization.id,
        items: organizations,
        columns: [
          { header: 'Organization', cell: (organization: Organization) => organization.name },
        ],
        actionFn: async (organization: Organization, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            )
          }
        },
        processingText: t('Removing user from organizations...', {
          count: organizations.length,
        }),
        successText: t('User removeed successfully.'),
        errorText: t('There were errors removing user from organizations.', {
          count: organizations.length,
        }),
        onClose: onClose,
      })
    },
    [organizationProgressDialog, t]
  )
  return removeUserToOrganizations
}
