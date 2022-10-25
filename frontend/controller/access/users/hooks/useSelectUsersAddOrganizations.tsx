import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'
import { useAddUsersToOrganizations } from './useAddUsersToOrganizations'
import { useSelectUsers } from './useSelectUsers'

export function useSelectUsersAddOrganizations(onClose?: (users: User[]) => void) {
  const { t } = useTranslation()
  const selectUsers = useSelectUsers()
  const addUsersToOrganizations = useAddUsersToOrganizations(onClose)
  const selectUsersAddOrganizations = useCallback(
    (organizations: Organization[]) => {
      selectUsers(
        t('Add users to organizations', { count: organizations.length }),
        (users: User[]) => {
          addUsersToOrganizations(users, organizations)
        }
      )
    },
    [addUsersToOrganizations, selectUsers, t]
  )
  return selectUsersAddOrganizations
}
