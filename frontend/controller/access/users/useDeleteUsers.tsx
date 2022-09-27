import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, TextCell, useSetDialog } from '../../../../framework'
import { compareStrings } from '../../../../framework/utils/compare'
import { getItemKey, requestDelete } from '../../../Data'
import { User } from '../users/User'
import { useUsersColumns } from '../users/Users'

export function useDeleteUsers(callback: (users: User[]) => void) {
    const { t } = useTranslation()
    const setDialog = useSetDialog()
    const columns = useUsersColumns({ disableLinks: true, disableSort: true })
    const deleteActionNameColumn = useMemo(
        () => ({
            header: t('Username'),
            cell: (user: User) => <TextCell text={user.username} />,
            sort: 'username',
            maxWidth: 200,
        }),
        [t]
    )
    const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
    const deleteUsers = (items: User[]) => {
        setDialog(
            <BulkActionDialog<User>
                title={t('Permanently delete users', { count: items.length })}
                confirmText={t('Yes, I confirm that I want to delete these {{count}} users.', { count: items.length })}
                submitText={t('Delete user', { count: items.length })}
                submitting={t('Deleting users', { count: items.length })}
                submittingTitle={t('Deleting {{count}} users', { count: items.length })}
                error={t('There were errors deleting users', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.username, r.username))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(user: User) => requestDelete(`/api/v2/users/${user.id}/`)}
            />
        )
    }
    return deleteUsers
}
