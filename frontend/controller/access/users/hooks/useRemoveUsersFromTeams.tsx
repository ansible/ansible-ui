import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { useSelectTeams } from '../../teams/hooks/useSelectTeams'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useRemoveUsersFromTeams(onClose?: () => void) {
  const { t } = useTranslation()
  const openSelectTeams = useSelectTeams()
  const openBulkProgressDialog = useBulkProgressDialog<User>()
  const openRemoveUsersToTeams = useCallback(
    (users: User[]) => {
      openSelectTeams(t('Remove users from teams'), (teams: Team[]) => {
        openBulkProgressDialog({
          title: t('Removing users from teams'),
          keyFn: (user: User) => user.id,
          items: users,
          columns: [{ header: 'Name', cell: (user: User) => user.username }],
          actionFn: async (user: User, signal: AbortSignal) => {
            for (const team of teams) {
              await requestPost(
                `/api/v2/users/${user.id.toString()}/roles/`,
                {
                  id: team.summary_fields.object_roles.member_role.id,
                  disassociate: true,
                },
                signal
              )
            }
          },
          processingText: t('Removing users from teams...'),
          successText: t('All users removed successfully.'),
          errorText: t('There were errors removing users from teams.'),
          onClose: onClose,
        })
      })
    },
    [onClose, openBulkProgressDialog, openSelectTeams, t]
  )
  return openRemoveUsersToTeams
}
