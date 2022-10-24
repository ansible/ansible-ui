import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { useSelectOrganizations } from '../../organizations/hooks/useSelectOrganizations'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'

export function useSelectOrganizationsRemoveUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const openSelectOrganizations = useSelectOrganizations()
  const openBulkProgressDialog = useBulkProgressDialog<User>()
  const openRemoveUsersToOrganizations = useCallback(
    (users: User[]) => {
      openSelectOrganizations(
        t('Remove users from organizations', { count: users.length }),
        (organizations: Organization[]) => {
          openBulkProgressDialog({
            title: t('Removing users from organizations', { count: users.length }),
            keyFn: (user: User) => user.id,
            items: users,
            columns: [{ header: 'Name', cell: (user: User) => user.username }],
            actionFn: async (user: User, signal: AbortSignal) => {
              for (const organization of organizations) {
                await requestPost(
                  `/api/v2/users/${user.id.toString()}/roles/`,
                  {
                    id: organization.summary_fields.object_roles.member_role.id,
                    disassociate: true,
                  },
                  signal
                )
              }
            },
            processingText: t('Removing users from organizations...', { count: users.length }),
            successText: t('All users removed successfully.', { count: users.length }),
            errorText: t('There were errors removing users from organizations.', {
              count: users.length,
            }),
            onClose: onClose,
          })
        }
      )
    },
    [onClose, openBulkProgressDialog, openSelectOrganizations, t]
  )
  return openRemoveUsersToOrganizations
}
