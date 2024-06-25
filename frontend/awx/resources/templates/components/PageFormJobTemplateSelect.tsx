import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { missingResources, useTemplateColumns } from '../hooks/useTemplateColumns';
import { useTemplateFilters } from '../hooks/useTemplateFilters';

export function PageFormJobTemplateSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  jobTemplatePath?: string;
  templateType?: 'job_templates' | 'workflow_job_templates';
}) {
  const { t } = useTranslation();
  const { templateType = 'job_templates' } = props;
  const tableColumns = useTemplateColumns();
  const toolbarFilters = useTemplateFilters();
  return (
    <PageFormSingleSelectAwxResource<JobTemplate, TFieldValues, TFieldName>
      name={props.name}
      missingResource={(template) =>
        missingResources(template) ? t(`Resources are missing from this template.`) : ''
      }
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      url={
        templateType === 'job_templates'
          ? awxAPI`/job_templates/`
          : awxAPI`/workflow_job_templates/`
      }
      id="job-template-select"
      label={
        props.templateType === 'workflow_job_templates'
          ? t('Workflow job template')
          : t('Job template')
      }
      placeholder={
        props.templateType === 'workflow_job_templates'
          ? t('Select a workflow job template')
          : t('Select job template')
      }
      queryPlaceholder={
        props.templateType === 'workflow_job_templates'
          ? t('Loading workflow job templates...')
          : t('Loading job templates...')
      }
      queryErrorText={
        props.templateType === 'workflow_job_templates'
          ? t('Error loading workflow job templates')
          : t('Error loading job templates')
      }
      isRequired={props.isRequired}
    />
  );
}
