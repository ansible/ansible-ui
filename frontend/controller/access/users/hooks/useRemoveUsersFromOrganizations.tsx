import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Organization } from '../../organizations/Organization'
import { useSelectOrganizations } from '../../organizations/useSelectOrganiztions'
import { User } from '../User'

export function useRemoveUsersFromOrganizations(onClose?: () => void) {
    const { t } = useTranslation()
    const openSelectOrganizations = useSelectOrganizations()
    const openBulkProgressDialog = useBulkProgressDialog<User>()
    const openRemoveUsersToOrganizations = useCallback(
        (users: User[]) => {
            openSelectOrganizations(
                t('Remove users from organizations'),
                (organizations: Organization[]) => {
                    openBulkProgressDialog({
                        title: t('Removing users from organizations'),
                        keyFn: (user: User) => user.id,
                        items: users,
                        columns: [{ header: 'Name', cell: (user: User) => user.username }],
                        actionFn: async (user: User, signal: AbortSignal) => {
                            for (const organization of organizations) {
                                await requestPost(
                                    `/api/v2/users/${user.id.toString()}/roles/`,
                                    {
                                        id: organization.summary_fields.object_roles.member_role.id,
                                        disassociate: true,
                                    },
                                    signal
                                )
                            }
                        },
                        processingText: t('Removing users from organizations...'),
                        successText: t('All users added successfully.'),
                        errorText: t('There were errors adding users from organizations.'),
                        onClose: onClose,
                    })
                }
            )
        },
        [onClose, openBulkProgressDialog, openSelectOrganizations, t]
    )
    return openRemoveUsersToOrganizations
}
