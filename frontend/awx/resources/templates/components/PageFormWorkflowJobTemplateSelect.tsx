import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useSelectWorkflowJobTemplate } from '../hooks/useSelectWorkflowJobTemplate';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';

export function PageFormWorkflowJobTemplateSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  workflowJobTemplatePath?: string;
  templateId?: number;
}) {
  const { t } = useTranslation();

  const openSelectDialog = useSelectWorkflowJobTemplate();
  const query = useCallback(async () => {
    const response = await requestGet<ItemsResponse<WorkflowJobTemplate>>(
      `/api/v2/workflow_job_templates/?page_size=200`
    );

    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      label={t('Job Template')}
      query={query}
      valueToString={(value) => {
        if (value && typeof value === 'string') {
          return value;
        }
        return (value as WorkflowJobTemplate)?.name ?? '';
      }}
      placeholder={t('Select job template')}
      loadingPlaceholder={t('Loading job templates...')}
      loadingErrorText={t('Error loading job templates')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
