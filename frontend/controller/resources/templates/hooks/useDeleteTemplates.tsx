import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../Data';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useTemplatesColumns } from '../Templates';

export function useDeleteTemplates(
  onComplete: (templates: (JobTemplate | WorkflowJobTemplate)[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useTemplatesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<JobTemplate | WorkflowJobTemplate>();
  const getSingularDeleteTitle = (type: string) =>
    type === 'job_template'
      ? t('Permanently delete job template')
      : t('Permanently delete workflow job template');
  const deleteTemplates = (templates: (JobTemplate | WorkflowJobTemplate)[]) => {
    bulkAction({
      title:
        templates.length === 1
          ? getSingularDeleteTitle(templates[0].type as string)
          : t('Permanently delete templates'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} templates.', {
        count: templates.length,
      }),
      actionButtonText: t('Delete template', { count: templates.length }),
      items: templates.sort((l: { name: string }, r: { name: string }) =>
        compareStrings(l.name, r.name)
      ),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (template: JobTemplate | WorkflowJobTemplate) => {
        if (template.type === 'job_template') {
          return requestDelete(`/api/v2/job_templates/${template.id}/`);
        } else {
          return requestDelete(`/api/v2/workflow_job_templates/${template.id}/`);
        }
      },
    });
  };
  return deleteTemplates;
}
