import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '../../users/User'
import { Organization } from '../Organization'
import { useRemoveOrganizationsFromUsers } from './useRemoveOrganizationsFromUsers'
import { useSelectOrganizations } from './useSelectOrganizations'

export function useSelectOrganizationsRemoveUsers(
  onClose?: (organizatinos: Organization[]) => void
) {
  const { t } = useTranslation()
  const selectOrganizations = useSelectOrganizations()
  const removeOrganizationsFromUsers = useRemoveOrganizationsFromUsers()
  const selectOrganizationsRemoveUsers = useCallback(
    (users: User[]) => {
      selectOrganizations(
        t('Remove users from organizations', { count: users.length }),
        (organizations: Organization[]) => {
          removeOrganizationsFromUsers(users, organizations, onClose)
        }
      )
    },
    [selectOrganizations, t, removeOrganizationsFromUsers, onClose]
  )
  return selectOrganizationsRemoveUsers
}
