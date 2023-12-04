import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { useSelectManagementJobs } from '../hooks/useSelectManagementJobs';
import { awxAPI } from '../../../api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function PageFormManagementJobsSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  jobTemplatePath?: string;
  templateId?: number;
}) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectManagementJobs();
  const query = useCallback(async () => {
    const response = await requestGet<AwxItemsResponse<SystemJobTemplate>>(
      awxAPI`/system_jobs/`.concat(`?page_size=200`)
    );

    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="management-job-template-select"
      label={t('Management Job Templates')}
      query={query}
      valueToString={(value) => {
        if (value && typeof value === 'string') {
          return value;
        }
        return (value as SystemJobTemplate)?.name ?? '';
      }}
      placeholder={t('Select a management job template')}
      loadingPlaceholder={t('Loading management job templates...')}
      loadingErrorText={t('Error loading management job templates')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
