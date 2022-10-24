import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { useSelectTeams } from '../../teams/hooks/useSelectTeams'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useAddUserToTeams(onClose?: () => void) {
  const { t } = useTranslation()
  const openSelectTeams = useSelectTeams()
  const openBulkProgressDialog = useBulkProgressDialog<Team>()
  const openAddUserToTeams = useCallback(
    (user: User) => {
      openSelectTeams(t('Add user to teams'), (teams: Team[]) => {
        openBulkProgressDialog({
          title: t('Adding user to teams'),
          keyFn: (team: Team) => team.id,
          items: teams,
          columns: [{ header: 'Team', cell: (team: Team) => team.name }],
          actionFn: async (team: Team, signal: AbortSignal) => {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              { id: team.summary_fields.object_roles.member_role.id },
              signal
            )
          },
          processingText: t('Adding user to teams...'),
          successText: t('User added successfully.'),
          errorText: t('There were errors adding user to teams.'),
          onClose: onClose,
        })
      })
    },
    [onClose, openBulkProgressDialog, openSelectTeams, t]
  )
  return openAddUserToTeams
}
