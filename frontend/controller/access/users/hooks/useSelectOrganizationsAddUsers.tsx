import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelectOrganizations } from '../../organizations/hooks/useSelectOrganizations'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'
import { useAddUsersToOrganizations } from './useAddUsersToOrganizations'

export function useSelectOrganizationsAddUsers(onClose?: () => void) {
  const { t } = useTranslation()
  const openSelectOrganizations = useSelectOrganizations()
  const addUsersToOrganizations = useAddUsersToOrganizations(onClose)
  const openAddUsersToOrganizations = useCallback(
    (users: User[]) => {
      openSelectOrganizations(t('Add users to organizations'), (organizations: Organization[]) => {
        addUsersToOrganizations(users, organizations)
      })
    },
    [addUsersToOrganizations, openSelectOrganizations, t]
  )
  return openAddUsersToOrganizations
}
