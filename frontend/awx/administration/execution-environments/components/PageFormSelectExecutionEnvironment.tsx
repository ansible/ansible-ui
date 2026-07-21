import { ReactNode, useMemo } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from '../hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from '../hooks/useExecutionEnvironmentsFilters';

/**
 * A form input for selecting an executionEnvironment.
 *
 * @example
 * ```tsx
 * <PageFormSelectExecutionEnvironment<ExecutionEnvironment> name="executionEnvironment" />
 * ```
 */
export function PageFormSelectExecutionEnvironment<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  isDisabled?: string;
  helperText?: string;
  organizationId?: number | null;
  label?: string;
  labelHelp?: string;
  additionalControls?: ReactNode;
}) {
  const { t } = useTranslation();
  const executionEnvironmentColumns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const executionEnvironmentFilters = useExecutionEnvironmentsFilters();
  const queryParams = useMemo(() => {
    return props.organizationId
      ? {
          or__organization__id: props.organizationId.toString(),
          or__organization__isnull: 'True',
        }
      : undefined;
  }, [props.organizationId]);

  return (
    <PageFormSingleSelectAwxResource<ExecutionEnvironment, TFieldValues, TFieldName>
      name={props.name}
      id="executionEnvironment"
      labelHelp={props.labelHelp}
      label={props.label ?? t('Execution environment')}
      placeholder={t('Select execution environment')}
      queryPlaceholder={t('Loading execution environments...')}
      queryErrorText={t('Error loading execution environments')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/execution_environments/`}
      queryParams={queryParams}
      tableColumns={executionEnvironmentColumns}
      toolbarFilters={executionEnvironmentFilters}
      additionalControls={props.additionalControls}
    />
  );
}
