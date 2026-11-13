import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { getItemKey, requestDelete, requestGet } from '@ansible/common-ui/crud/Data';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { useTemplateColumns } from './useTemplateColumns';

async function getWorkflowJobTemplateNodeCount(templateId: number) {
  try {
    const relatedNodes = await requestGet<AwxItemsResponse<WorkflowNode>>(
      awxAPI`/workflow_job_template_nodes/?unified_job_template=${templateId.toString()}`
    );
    return relatedNodes?.count ?? 0;
  } catch {
    // Auxiliary check failed — open delete confirmation without an in-use warning.
    return 0;
  }
}

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

  const deleteTemplates = async (templates: (JobTemplate | WorkflowJobTemplate)[]) => {
    const alertPrompts: string[] = [];

    if (templates.length > 1) {
      alertPrompts.push(t('Deleting templates could impact other resources that rely on them.'));
    } else if (templates.length === 1 && templates[0].type === 'job_template') {
      const workflowJobTemplateNodeCount = await getWorkflowJobTemplateNodeCount(templates[0].id);
      if (workflowJobTemplateNodeCount > 0) {
        alertPrompts.push(
          t(
            'This job template is currently being used by other resources. Are you sure you want to delete it?'
          ),
          t('Workflow Job Template Nodes [{{count}}]', {
            count: workflowJobTemplateNodeCount,
          })
        );
      }
    }

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
      alertPrompts: alertPrompts.length > 0 ? alertPrompts : undefined,
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
