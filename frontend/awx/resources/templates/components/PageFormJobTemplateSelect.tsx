import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useSelectJobTemplate } from '../hooks/useSelectJobTemplate';

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
  const openSelectDialog = useSelectJobTemplate();
  const query = useCallback(async () => {
    const response = await requestGet<AwxItemsResponse<JobTemplate>>(
      awxAPI`/${templateType}/`.concat(`?page_size=200`)
    );

    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, [templateType]);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="job-template-select"
      label={
        props.templateType === 'workflow_job_templates'
          ? t('Workflow job template')
          : t('Job template')
      }
      query={query}
      valueToString={(value) => {
        if (value && typeof value === 'string') {
          return value;
        }
        return (value as JobTemplate)?.name ?? '';
      }}
      placeholder={
        props.templateType === 'workflow_job_templates'
          ? t('Select a workflow job template')
          : t('Select job template')
      }
      loadingPlaceholder={
        props.templateType === 'workflow_job_templates'
          ? t('Loading workflow job templates...')
          : t('Loading job templates...')
      }
      loadingErrorText={
        props.templateType === 'workflow_job_templates'
          ? t('Error loading workflow job templates')
          : t('Error loading job templates')
      }
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
