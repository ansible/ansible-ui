import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRemoveUsersFromOrganizations } from '../../users/hooks/useRemoveUsersFromOrganizations'
import { User } from '../../users/User'
import { Organization } from '../Organization'
import { useSelectOrganizations } from './useSelectOrganizations'

export function useSelectOrganizationsRemoveUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const selectOrganizations = useSelectOrganizations()
  const removeUsersFromOrganizations = useRemoveUsersFromOrganizations(onClose)
  const selectOrganizationsRemoveUsers = useCallback(
    (users: User[]) => {
      selectOrganizations(
        t('Remove users from organizations', { count: users.length }),
        (organizations: Organization[]) => {
          removeUsersFromOrganizations(users, organizations)
        }
      )
    },
    [selectOrganizations, removeUsersFromOrganizations, t]
  )
  return selectOrganizationsRemoveUsers
}
