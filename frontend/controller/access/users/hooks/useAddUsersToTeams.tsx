import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useAddUsersToTeams(onClose?: (users: User[]) => void) {
  const { t } = useTranslation()
  const userProgressDialog = useBulkProgressDialog<User>()
  const addUserToTeams = useCallback(
    (users: User[], teams: Team[]) => {
      userProgressDialog({
        title: t('Adding users to teams', {
          count: teams.length,
        }),
        keyFn: (user: User) => user.id,
        items: users,
        columns: [{ header: 'User', cell: (user: User) => user.username }],
        actionFn: async (user: User, signal: AbortSignal) => {
          for (const team of teams) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id },
              signal
            )
          }
        },
        processingText: t('Adding users to teams...', {
          count: teams.length,
        }),
        successText: t('Users added successfully.'),
        errorText: t('There were errors adding users to teams.', {
          count: teams.length,
        }),
        onClose: onClose,
      })
    },
    [userProgressDialog, t, onClose]
  )
  return addUserToTeams
}
