import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useExecutionEnvironmentFilters } from '../../../../hub/execution-environments/hooks/useExecutionEnvironmentFilters';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from '../hooks/useExecutionEnvironmentsColumns';

export function PageFormExecutionEnvironmentSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  isDisabled?: string;
  helperText?: string;
  organizationId?: string;
  additionalControls?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const columns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const filters = useExecutionEnvironmentFilters();
  const url = props.organizationId
    ? awxAPI`/execution_environments/?or__organization__isnull=True&or__organization__id=${props.organizationId}`
    : awxAPI`/execution_environments/`;
  return (
    <PageFormSingleSelectAwxResource<ExecutionEnvironment, TFieldValues, TFieldName>
      name={props.name}
      id="execution-environment"
      label={t('Execution environment')}
      placeholder={t('Select execution environment')}
      queryPlaceholder={t('Loading execution environments...')}
      queryErrorText={t('Error loading execution environments')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={url}
      tableColumns={columns}
      toolbarFilters={filters}
      additionalControls={props.additionalControls}
    />
  );
}
