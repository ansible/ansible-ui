import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'

export function useAddUsersToOrganizations(onClose?: () => void) {
  const { t } = useTranslation()
  const openOrganizationProgressDialog = useBulkProgressDialog<Organization>()
  const openUserProgressDialog = useBulkProgressDialog<User>()
  const openAddUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[]) => {
      if (users.length === 1) {
        openOrganizationProgressDialog({
          title: t('Adding user to organizations'),
          keyFn: (organization: Organization) => organization.id,
          items: organizations,
          columns: [
            { header: 'Organization', cell: (organization: Organization) => organization.name },
          ],
          actionFn: async (organization: Organization, signal: AbortSignal) => {
            await requestPost(
              `/api/v2/users/${users[0].id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id },
              signal
            )
          },
          processingText: t('Adding user to organizations...'),
          successText: t('User added successfully.'),
          errorText: t('There were errors adding user to organizations.'),
          onClose: onClose,
        })
      } else {
        openUserProgressDialog({
          title: t('Adding user to organizations'),
          keyFn: (user: User) => user.id,
          items: users,
          columns: [{ header: 'User', cell: (user: User) => user.username }],
          actionFn: async (user: User, signal: AbortSignal) => {
            for (const organization of organizations) {
              await requestPost(
                `/api/v2/users/${user.id.toString()}/roles/`,
                { id: organization.summary_fields.object_roles.member_role.id },
                signal
              )
            }
          },
          processingText: t('Adding user to organizations...'),
          successText: t('User added successfully.'),
          errorText: t('There were errors adding user to organizations.'),
          onClose: onClose,
        })
      }
    },
    [onClose, openOrganizationProgressDialog, openUserProgressDialog, t]
  )
  return openAddUserToOrganizations
}
