import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { useSelectJobTemplate } from '../hooks/useSelectJobTemplate';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';

export function PageFormJobTemplateSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  jobTemplatePath?: string;
  templateId?: number;
}) {
  const { t } = useTranslation();

  const openSelectDialog = useSelectJobTemplate();
  const query = useCallback(async () => {
    const response = await requestGet<ItemsResponse<JobTemplate>>(
      `/api/v2/job_templates/?page_size=200`
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
        return (value as JobTemplate)?.name ?? '';
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
