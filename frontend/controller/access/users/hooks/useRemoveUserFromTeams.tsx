import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { useSelectTeams } from '../../teams/hooks/useSelectTeams'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useRemoveUserFromSelectedTeams(onClose?: () => void) {
  const { t } = useTranslation()
  const openBulkProgressDialog = useBulkProgressDialog<Team>()
  const openRemoveUserFromTeams = useCallback(
    (user: User, teams: Team[]) => {
      openBulkProgressDialog({
        title: t('Removing user from teams'),
        keyFn: (team: Team) => team.id,
        items: teams,
        columns: [
          {
            header: 'Team',
            cell: (team: Team) => team.name,
          },
        ],
        actionFn: async (team: Team, signal: AbortSignal) => {
          await requestPost(
            `/api/v2/users/${user.id.toString()}/roles/`,
            {
              id: team.summary_fields.object_roles.member_role.id,
              disassociate: true,
            },
            signal
          )
        },
        processingText: t('Removing user from teams...'),
        successText: t('User removed successfully.'),
        errorText: t('There were errors removing user from teams.'),
        onClose: onClose,
      })
    },
    [onClose, openBulkProgressDialog, t]
  )
  return openRemoveUserFromTeams
}

export function useRemoveUserFromTeams(onClose?: () => void) {
  const { t } = useTranslation()
  const openSelectTeams = useSelectTeams()
  const openBulkProgressDialog = useBulkProgressDialog<Team>()
  const openRemoveUsersToTeams = useCallback(
    (user: User) => {
      openSelectTeams(t('Remove user from teams'), (teams: Team[]) => {
        openBulkProgressDialog({
          title: t('Removing user from teams'),
          keyFn: (team: Team) => team.id,
          items: teams,
          columns: [{ header: 'Name', cell: (team: Team) => team.name }],
          actionFn: async (team: Team, signal: AbortSignal) => {
            await requestPost(
              `/api/v2/users/${user.id.toString()}/roles/`,
              {
                id: team.summary_fields.object_roles.member_role.id,
                disassociate: true,
              },
              signal
            )
          },
          processingText: t('Removing user from teams...'),
          successText: t('User removed from all teams successfully.'),
          errorText: t('There were errors removing user from teams.'),
          onClose: onClose,
        })
      })
    },
    [onClose, openBulkProgressDialog, openSelectTeams, t]
  )
  return openRemoveUsersToTeams
}
