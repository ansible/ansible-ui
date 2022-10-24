import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useRemoveUsersFromTeams() {
  const { t } = useTranslation()
  const userProgressDialog = useBulkProgressDialog<User>()
  const removeUserToTeams = useCallback(
    (users: User[], teams: Team[], onClose?: (users: User[]) => void) => {
      userProgressDialog({
        title: t('Removing users from teams', {
          count: teams.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        columns: [{ header: 'User', cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const team of teams) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            )
          }
        },
        processingText: t('Removing users from teams...', {
          count: teams.length,
        }),
        successText: t('Users removeed successfully.'),
        errorText: t('There were errors removing users from teams.', {
          count: teams.length,
        }),
        onClose: onClose,
      })
    },
    [userProgressDialog, t]
  )
  return removeUserToTeams
}
