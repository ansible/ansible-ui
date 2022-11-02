import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { Project } from '../Project'
import { useProjectsColumns } from '../Projects'

export function useDeleteProjects(callback: (projects: Project[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useProjectsColumns()
  const errorColumns = columns
  const deleteProjects = (items: Project[]) => {
    setDialog(
      <BulkActionDialog<Project>
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
        action={(project: Project) => requestDelete(`/api/projects/${project.id}/`)}
      />
    )
  }
  return deleteProjects
}
