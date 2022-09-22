import { useMemo } from 'react'
import { BulkActionDialog, TextCell, useSetDialog } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
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
                confirm={t('Yes, I confirm that I want to delete these {{count}} users.', { count: items.length })}
                submit={t('Delete')}
                submitting={t('Deleting')}
                submittingTitle={t('Deleting {{count}} users', { count: items.length })}
                success={t('Success')}
                cancel={t('Cancel')}
                close={t('Close')}
                error={t('There were errors deleting users')}
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
