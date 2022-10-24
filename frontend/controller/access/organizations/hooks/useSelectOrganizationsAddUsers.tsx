import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAddUsersToOrganizations } from '../../users/hooks/useAddUsersToOrganizations'
import { User } from '../../users/User'
import { Organization } from '../Organization'
import { useSelectOrganizations } from './useSelectOrganizations'

export function useSelectOrganizationsAddUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const selectOrganizations = useSelectOrganizations()
  const addUsersToOrganizations = useAddUsersToOrganizations(onClose)
  const selectOrganizationsAddUsers = useCallback(
    (users: User[]) => {
      selectOrganizations(
        t('Add users to organizations', { count: users.length }),
        (organizations: Organization[]) => {
          addUsersToOrganizations(users, organizations)
        }
      )
    },
    [addUsersToOrganizations, selectOrganizations, t]
  )
  return selectOrganizationsAddUsers
}
