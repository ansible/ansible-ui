import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { EdaProject } from '../../interfaces/EdaProject'
import { useProjectsColumns } from './useProjectsColumns'

export function useDeleteProjects(callback: (projects: EdaProject[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useProjectsColumns()
  const errorColumns = columns
  const deleteProjects = (items: EdaProject[]) => {
    setDialog(
      <BulkActionDialog<EdaProject>
        title={t('Permanently delete projects', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} projects.', {
          count: items.length,
        })}
        submitText={t('Delete projects', { count: items.length })}
        submitting={t('Deleting projects', { count: items.length })}
        submittingTitle={t('Deleting {{count}} projects', { count: items.length })}
        error={t('There were errors deleting projects', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={idKeyFn}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onClose={callback}
        action={(project: EdaProject) => requestDelete(`/api/projects/${project.id}`)}
      />
    )
  }
  return deleteProjects
}
