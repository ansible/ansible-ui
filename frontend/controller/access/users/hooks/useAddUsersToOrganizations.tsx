import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'

export function useAddUsersToOrganizations() {
  const { t } = useTranslation()
  const userProgressDialog = useBulkProgressDialog<User>()
  const addUserToOrganizations = useCallback(
    (users: User[], organizations: Organization[], onClose?: (users: User[]) => void) => {
      userProgressDialog({
        title: t('Adding users to organizations', {
          count: organizations.length,
        }),
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
        processingText: t('Adding users to organizations...', {
          count: organizations.length,
        }),
        successText: t('Users added successfully.'),
        errorText: t('There were errors adding users to organizations.', {
          count: organizations.length,
        }),
        onClose: onClose,
      })
    },
    [userProgressDialog, t]
  )
  return addUserToOrganizations
}
