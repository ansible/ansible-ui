import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useTemplateColumns } from './useTemplateColumns';

export function useDeleteTemplates(
  onComplete: (templates: (JobTemplate | WorkflowJobTemplate)[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useTemplateColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<JobTemplate | WorkflowJobTemplate>();
  const getSingularDeleteTitle = (type: string) =>
    type === 'job_template'
      ? t('Permanently delete job template')
      : t('Permanently delete workflow job template');
  const deleteTemplates = (templates: (JobTemplate | WorkflowJobTemplate)[]) => {
    bulkAction({
      title:
        templates.length === 1
          ? getSingularDeleteTitle(templates[0].type)
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
      actionFn: (template: JobTemplate | WorkflowJobTemplate, signal) => {
        if (template.type === 'job_template') {
          return requestDelete(awxAPI`/job_templates/${template.id.toString()}/`, signal);
        } else {
          return requestDelete(awxAPI`/workflow_job_templates/${template.id.toString()}/`, signal);
        }
      },
    });
  };
  return deleteTemplates;
}
