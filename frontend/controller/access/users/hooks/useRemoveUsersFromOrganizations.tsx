import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'

export function useRemoveUsersFromOrganizations(onClose?: (users: User[]) => void) {
  const { t } = useTranslation()
  const userProgressDialog = useBulkProgressDialog<User>()
  const removeUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[]) => {
      userProgressDialog({
        title: t('Removing users from organizations', {
          count: organizations.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        columns: [{ header: 'User', cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const organization of organizations) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: organization.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            )
          }
        },
        processingText: t('Removing users from organizations...', {
          count: organizations.length,
        }),
        successText: t('Users removeed successfully.'),
        errorText: t('There were errors removing users from organizations.', {
          count: organizations.length,
        }),
        onClose: onClose,
      })
    },
    [userProgressDialog, t, onClose]
  )
  return removeUserToOrganizations
}
