import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { User } from '../../users/User'
import { Organization } from '../Organization'
import { useAddOrganizationsToUsers } from './useAddOrganizationsToUsers'
import { useSelectOrganizations } from './useSelectOrganizations'

export function useSelectOrganizationsAddUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const selectOrganizations = useSelectOrganizations()
  const addOrganizationsToUsers = useAddOrganizationsToUsers()
  const selectOrganizationsAddUsers = useCallback(
    (users: User[]) => {
      selectOrganizations(
        t('Add users to organizations', { count: users.length }),
        (organizations: Organization[]) => {
          addOrganizationsToUsers(users, organizations, onClose)
        }
      )
    },
    [addOrganizationsToUsers, onClose, selectOrganizations, t]
  )
  return selectOrganizationsAddUsers
}
