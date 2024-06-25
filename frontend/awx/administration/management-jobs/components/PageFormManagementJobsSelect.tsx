import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
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
  const filters = useManagementJobFilters();

  return (
    <PageFormSingleSelectAwxResource<SystemJobTemplate, TFieldValues, TFieldName>
      name={props.name}
      tableColumns={tableColumns}
      toolbarFilters={filters}
      id="management-job-template-select"
      label={t('Management job template')}
      placeholder={t('Select a management job template')}
      queryPlaceholder={t('Loading management job templates...')}
      queryErrorText={t('Error loading management job templates')}
      isRequired={props.isRequired}
      url={awxAPI`/system_job_templates/`}
    />
  );
}
