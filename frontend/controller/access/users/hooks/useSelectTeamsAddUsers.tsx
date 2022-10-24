import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAddTeamsToUsers } from '../../teams/hooks/useAddTeamsToUsers'
import { useSelectTeams } from '../../teams/hooks/useSelectTeams'
import { Team } from '../../teams/Team'
import { User } from '../User'

export function useSelectTeamsAddUsers(onClose?: (teams: Team[]) => void) {
  const { t } = useTranslation()
  const selectTeams = useSelectTeams()
  const addTeamsToUsers = useAddTeamsToUsers()
  const selectTeamsAddUsers = useCallback(
    (users: User[]) => {
      selectTeams(t('Add users to teams', { count: users.length }), (teams: Team[]) => {
        addTeamsToUsers(teams, users, onClose)
      })
    },
    [addTeamsToUsers, onClose, selectTeams, t]
  )
  return selectTeamsAddUsers
}
