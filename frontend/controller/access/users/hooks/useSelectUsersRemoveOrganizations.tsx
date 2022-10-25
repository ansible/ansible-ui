import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'
import { useRemoveUsersFromOrganizations } from './useRemoveUsersFromOrganizations'
import { useSelectUsers } from './useSelectUsers'

export function useSelectUsersRemoveOrganizations(onClose?: (users: User[]) => void) {
  const { t } = useTranslation()
  const selectUsers = useSelectUsers()
  const removeUsersFromOrganizations = useRemoveUsersFromOrganizations(onClose)
  const selectUsersRemoveOrganizations = useCallback(
    (organizations: Organization[]) => {
      selectUsers(
        t('Remove users from organizations', { count: organizations.length }),
        (users: User[]) => {
          removeUsersFromOrganizations(users, organizations)
        }
      )
    },
    [removeUsersFromOrganizations, selectUsers, t]
  )
  return selectUsersRemoveOrganizations
}
