import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../../interfaces/Organization'
import { User } from '../../../interfaces/User'

export function useAddOrganizationsToUsers() {
  const { t } = useTranslation()
  const organizationProgressDialog = useBulkProgressDialog<Organization>()
  const addUserToOrganizations = useCallback(
    (
      users: User[],
      organizations: Organization[],
      onClose?: (organizations: Organization[]) => void
    ) => {
      organizationProgressDialog({
        title: t('Adding users to organizations', {
          count: organizations.length,
        }),
        keyFn: (organization: Organization) => organization.id,
        items: organizations,
        progressColumns: [
          { header: 'Organization', cell: (organization: Organization) => organization.name },
        ],
        actionFn: async (organization: Organization, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id },
              signal
            )
          }
        },
        processingText: t('Adding user to organizations...', {
          count: organizations.length,
        }),
        successText: t('User added successfully.'),
        errorText: t('There were errors adding user to organizations.', {
          count: organizations.length,
        }),
        onClose: onClose,
      })
    },
    [organizationProgressDialog, t]
  )
  return addUserToOrganizations
}
