import { useTranslation } from 'react-i18next';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { AwxSettingsOptionsAction } from './AwxSettingsForm';
import { PageDetail } from '@ansible/ansible-ui-framework';

export function DefaultExecutionEnvironmentDetail(props: {
  option: AwxSettingsOptionsAction;
  id: number;
}) {
  const { option, id } = props;
  const { t } = useTranslation();
  const {
    data: executionEnvironment,
    isLoading,
    error,
  } = useGet<ExecutionEnvironment>(id ? awxAPI`/execution_environments/${id}/` : '');

  let label = executionEnvironment?.name;
  if (isLoading) {
    label = t('Loading...');
  } else if (error) {
    label = t('Error loading execution environment');
  }

  return (
    <PageDetail label={option.label} helpText={option.help_text}>
      {label}
    </PageDetail>
  );
}
