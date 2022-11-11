import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Team } from '../../../interfaces/Team'
import { User } from '../../../interfaces/User'

export function useRemoveTeamsFromUsers(onClose?: (team: Team[]) => void) {
  const { t } = useTranslation()
  const bulkProgressDialog = useBulkProgressDialog<Team>()
  const removeUserToTeams = useCallback(
    (users: User[], teams: Team[]) => {
      bulkProgressDialog({
        title: t('Removing user from teams', {
          count: teams.length,
        }),
        keyFn: (team: Team) => team.id,
        items: teams,
        columns: [{ header: 'Team', cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id, disassociate: true },
              signal
            )
          }
        },
        processingText: t('Removing user from teams...', {
          count: teams.length,
        }),
        successText: t('User removeed successfully.'),
        errorText: t('There were errors removing user from teams.', {
          count: teams.length,
        }),
        onClose: onClose,
      })
    },
    [onClose, bulkProgressDialog, t]
  )
  return removeUserToTeams
}
