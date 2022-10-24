import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelectOrganizations } from '../../organizations/hooks/useSelectOrganizations'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'
import { useRemoveUsersFromOrganizations } from './useRemoveUsersFromOrganizations'

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
