import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BulkConfirmationDialog,
  compareStrings,
  TextCell,
  usePageDialog,
} from '../../../../../framework'
import { getItemKey, requestDelete } from '../../../../Data'
import { User } from '../../../interfaces/User'
import { useUsersColumns } from '../Users'

export function useDeleteUsers(callback: (users: User[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
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
  const deleteUsers = (users: User[]) => {
    setDialog(
      <BulkConfirmationDialog<User>
        title={t('Permanently delete users', { count: users.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} users.', {
          count: users.length,
        })}
        submitText={t('Delete user', { count: users.length })}
        submitting={t('Deleting users', { count: users.length })}
        submittingTitle={t('Deleting {{count}} users', { count: users.length })}
        error={t('There were errors deleting users', { count: users.length })}
        items={users.sort((l, r) => compareStrings(l.username, r.username))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onConfirm={callback}
        action={(user: User) => requestDelete(`/api/v2/users/${user.id}/`)}
      />
    )
  }
  return deleteUsers
}
