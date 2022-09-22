import { useMemo } from 'react'
import { BulkActionDialog, useSetDialog } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { compareStrings } from '../../../../framework/utils/compare'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { Team } from './Team'

export function useDeleteTeams(callback: (teams: Team[]) => void) {
    const { t } = useTranslation()
    const setDialog = useSetDialog()
    const deleteActionNameColumn = useNameColumn({ disableSort: true })
    const deleteActionOrganizationColumn = useOrganizationNameColumn({ disableLink: true, disableSort: true })
    const deleteActionCreatedColumn = useCreatedColumn({ disableSort: true })
    const deleteActionModifiedColumn = useModifiedColumn({ disableSort: true })
    const columns = useMemo(
        () => [deleteActionNameColumn, deleteActionOrganizationColumn, deleteActionCreatedColumn, deleteActionModifiedColumn],
        [deleteActionCreatedColumn, deleteActionModifiedColumn, deleteActionNameColumn, deleteActionOrganizationColumn]
    )
    const errorColumns = useMemo(
        () => [deleteActionNameColumn, deleteActionOrganizationColumn],
        [deleteActionNameColumn, deleteActionOrganizationColumn]
    )
    const deleteTeams = (items: Team[]) => {
        setDialog(
            <BulkActionDialog<Team>
                title={t('Permanently delete teams', { count: items.length })}
                confirm={t('Yes, I confirm that I want to delete these {{count}} teams.', { count: items.length })}
                submit={t('Delete')}
                submitting={t('Deleting')}
                submittingTitle={t('Deleting {{count}} teams', { count: items.length })}
                success={t('Success')}
                cancel={t('Cancel')}
                close={t('Close')}
                error={t('There were errors deleting teams', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={getItemKey}
                isDanger
                columns={columns}
                errorColumns={errorColumns}
                onClose={callback}
                action={(team: Team) => requestDelete(`/api/v2/teams/${team.id}/`)}
            />
        )
    }
    return deleteTeams
}
