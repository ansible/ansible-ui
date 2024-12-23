import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobColumns } from '../hooks/useManagementJobColumns';
import { useManagementJobFilters } from '../hooks/useManagementJobFilters';

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
  const tableColumns = useManagementJobColumns();
  const toolbarFilters = useManagementJobFilters();

  return (
    <PageFormSingleSelectAwxResource<SystemJobTemplate, TFieldValues, TFieldName>
      name={props.name}
      id="management-job-template-select"
      label={t('Management job template')}
      url={awxAPI`/system_job_templates/`}
      placeholder={t('Select management job template')}
      isRequired={props.isRequired}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      queryPlaceholder={t('Loading management job templates...')}
      queryErrorText={t('Error loading management job templates')}
    />
  );
}
