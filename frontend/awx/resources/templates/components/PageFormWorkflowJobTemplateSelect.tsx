import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useSelectWorkflowJobTemplate } from '../hooks/useSelectWorkflowJobTemplate';

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

  const openSelectDialog = useSelectWorkflowJobTemplate();
  const query = useCallback(async () => {
    const response = await requestGet<AwxItemsResponse<WorkflowJobTemplate>>(
      awxAPI`/workflow_job_templates/`.concat(`?page_size=200`)
    );

    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="workflow-job-template-select"
      label={t('Workflow job template')}
      query={query}
      valueToString={(value) => {
        if (value && typeof value === 'string') {
          return value;
        }
        return (value as WorkflowJobTemplate)?.name ?? '';
      }}
      placeholder={t('Select workflow job template')}
      loadingPlaceholder={t('Loading workflow job templates...')}
      loadingErrorText={t('Error loading workflow job templates')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
