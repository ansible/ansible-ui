import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelectOrganizations } from '../../organizations/hooks/useSelectOrganizations'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'
import { useAddUsersToOrganizations } from './useAddUsersToOrganizations'

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
