import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useBulkProgressDialog } from '../../../../../framework/BulkProgressDialog'
import { requestPost } from '../../../../Data'
import { Team } from '../../teams/Team'
import { useSelectTeams } from '../../teams/useSelectTeams'
import { User } from '../User'

export function useAddUsersToTeams(onClose?: () => void) {
    const { t } = useTranslation()
    const openSelectTeams = useSelectTeams()
    const openBulkProgressDialog = useBulkProgressDialog<User>()
    const openAddUsersToTeams = useCallback(
        (users: User[]) => {
            openSelectTeams(t('Add users to teams'), (teams: Team[]) => {
                openBulkProgressDialog({
                    title: t('Adding users to teams'),
                    keyFn: (user: User) => user.id,
                    items: users,
                    columns: [{ header: 'Name', cell: (user: User) => user.username }],
                    actionFn: async (user: User, signal: AbortSignal) => {
                        for (const team of teams) {
                            await requestPost(
                                `/api/v2/users/${user.id.toString()}/roles/`,
                                { id: team.summary_fields.object_roles.member_role.id },
                                signal
                            )
                        }
                    },
                    processingText: t('Adding users to teams...'),
                    successText: t('All users added successfully.'),
                    errorText: t('There were errors adding users to teams.'),
                    onClose: onClose,
                })
            })
        },
        [onClose, openBulkProgressDialog, openSelectTeams, t]
    )
    return openAddUsersToTeams
}
