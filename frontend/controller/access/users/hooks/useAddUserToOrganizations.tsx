import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { useSelectOrganizations } from '../../organizations/useSelectOrganiztions'
import { User } from '../User'

export function useAddUserToOrganizations(onClose?: () => void) {
    const { t } = useTranslation()
    const openSelectOrganizations = useSelectOrganizations()
    const openBulkProgressDialog = useBulkProgressDialog<Organization>()
    const openAddUserToOrganizations = useCallback(
        (user: User) => {
            openSelectOrganizations(
                t('Add user to organizations'),
                (organizations: Organization[]) => {
                    openBulkProgressDialog({
                        title: t('Adding user to organizations'),
                        keyFn: (organization: Organization) => organization.id,
                        items: organizations,
                        columns: [
                            {
                                header: 'Organization',
                                cell: (organization: Organization) => organization.name,
                            },
                        ],
                        actionFn: async (organization: Organization, signal: AbortSignal) => {
                            await requestPost(
                                `/api/v2/users/${user.id.toString()}/roles/`,
                                { id: organization.summary_fields.object_roles.member_role.id },
                                signal
                            )
                        },
                        processingText: t('Adding user to organizations...'),
                        successText: t('User added successfully.'),
                        errorText: t('There were errors adding user to organizations.'),
                        onClose: onClose,
                    })
                }
            )
        },
        [onClose, openBulkProgressDialog, openSelectOrganizations, t]
    )
    return openAddUserToOrganizations
}
