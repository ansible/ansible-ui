import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRemoveTeamsFromUsers } from '../../teams/hooks/useRemoveTeamsFromUsers'
import { useSelectTeams } from '../../teams/hooks/useSelectTeams'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useSelectTeamsRemoveUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const selectTeams = useSelectTeams()
  const removeTeamsFromUsers = useRemoveTeamsFromUsers(onClose)
  const selectTeamsRemoveUsers = useCallback(
    (users: User[]) => {
      selectTeams(t('Remove users from teams', { count: users.length }), (teams: Team[]) => {
        removeTeamsFromUsers(users, teams)
      })
    },
    [selectTeams, removeTeamsFromUsers, t]
  )
  return selectTeamsRemoveUsers
}
