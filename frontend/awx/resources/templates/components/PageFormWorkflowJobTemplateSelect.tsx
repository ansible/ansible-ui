import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { useTemplateColumns } from '../hooks/useTemplateColumns';
import { useTemplateFilters } from '../hooks/useTemplateFilters';

export function PageFormWorkflowJobTemplateSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  workflowJobTemplatePath?: string;
  templateId?: number;
}) {
  const { t } = useTranslation();

  const filters = useTemplateFilters();
  const tableColumns = useTemplateColumns();

  return (
    <PageFormSingleSelectAwxResource<WorkflowJobTemplate, TFieldValues, TFieldName>
      name={props.name}
      tableColumns={tableColumns}
      toolbarFilters={filters}
      id="workflow-job-template-select"
      label={t('Workflow job template')}
      url={awxAPI`/workflow_job_templates/`}
      placeholder={t('Select workflow job template')}
      queryPlaceholder={t('Loading workflow job templates...')}
      queryErrorText={t('Error loading management job templates')}
      isRequired={props.isRequired}
    />
  );
}
