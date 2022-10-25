import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '../../users/User'
import { Team } from '../Team'
import { useRemoveTeamsFromUsers } from './useRemoveTeamsFromUsers'
import { useSelectTeams } from './useSelectTeams'

export function useSelectTeamsRemoveUsers(onClose?: (teams: Team[]) => void) {
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
