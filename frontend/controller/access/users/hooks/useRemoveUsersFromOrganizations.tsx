import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkActionDialog } from '../../../../../framework/BulkActionDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../../interfaces/Organization'
import { User } from '../../../interfaces/User'

export function useRemoveUsersFromOrganizations(onComplete?: (users: User[]) => void) {
  const { t } = useTranslation()
  const userProgressDialog = useBulkActionDialog<User>()
  const removeUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[]) => {
      userProgressDialog({
        title: t('Removing users from organizations', {
          count: organizations.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        actionColumns: [{ header: 'User', cell: (user: User) => user.username }],
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
        onComplete,
      })
    },
    [userProgressDialog, t, onComplete]
  )
  return removeUserToOrganizations
}
