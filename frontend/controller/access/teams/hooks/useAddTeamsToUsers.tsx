import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Team } from '../../../interfaces/Team'
import { User } from '../../../interfaces/User'

export function useAddTeamsToUsers() {
  const { t } = useTranslation()
  const teamProgressDialog = useBulkProgressDialog<Team>()
  const addTeamsToUser = useCallback(
    (teams: Team[], users: User[], onClose?: (teams: Team[]) => void) => {
      teamProgressDialog({
        title: t('Adding user to teams', { count: teams.length }),
        keyFn: (team: Team) => team.id,
        items: teams,
        progressColumns: [{ header: 'Team', cell: (team: Team) => team.name }],
        actionFn: async (team: Team, signal: AbortSignal) => {
          for (const user of users) {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id },
              signal
            )
          }
        },
        processingText: t('Adding user to teams...', { count: teams.length }),
        successText: t('User added successfully.'),
        errorText: t('There were errors adding the user to teams.', { count: teams.length }),
        onClose: onClose,
      })
    },
    [teamProgressDialog, t]
  )
  return addTeamsToUser
}
