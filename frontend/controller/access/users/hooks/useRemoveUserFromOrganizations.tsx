import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { User } from '../User'

export function useRemoveUserFromOrganizations(onClose?: () => void) {
    const { t } = useTranslation()
    const openBulkProgressDialog = useBulkProgressDialog<Organization>()
    const openRemoveUserFromOrganizations = useCallback(
        (user: User, organizations: Organization[]) => {
            openBulkProgressDialog({
                title: t('Removing user from organizations'),
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
                        {
                            id: organization.summary_fields.object_roles.member_role.id,
                            disassociate: true,
                        },
                        signal
                    )
                },
                processingText: t('Removing user from organizations...'),
                successText: t('User removed successfully.'),
                errorText: t('There were errors removing user from organizations.'),
                onClose: onClose,
            })
        },
        [onClose, openBulkProgressDialog, t]
    )
    return openRemoveUserFromOrganizations
}
