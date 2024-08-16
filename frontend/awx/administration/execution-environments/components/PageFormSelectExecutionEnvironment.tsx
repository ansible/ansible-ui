import { ReactElement, ReactNode } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from '../hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from '../hooks/useExecutionEnvironmentsFilters';
import { useSelectExecutionEnvironments } from '../hooks/useSelectExecutionEnvironments';

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
  additionalControls?: ReactNode;
}) {
  const { t } = useTranslation();
  const executionEnvironmentColumns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const executionEnvironmentFilters = useExecutionEnvironmentsFilters();
  return (
    <PageFormSingleSelectAwxResource<ExecutionEnvironment, TFieldValues, TFieldName>
      name={props.name}
      id="executionEnvironment"
      label={props.label ?? t('Execution environment')}
      placeholder={t('Select execution environment')}
      queryPlaceholder={t('Loading execution environments...')}
      queryErrorText={t('Error loading execution environments')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/execution_environments/`}
      queryParams={
        props.organizationId
          ? {
              or__organization__id: props.organizationId.toString(),
              or__organization__isnull: 'True',
            }
          : undefined
      }
      tableColumns={executionEnvironmentColumns}
      toolbarFilters={executionEnvironmentFilters}
      additionalControls={props.additionalControls}
    />
  );
}

/** @deprecated use PageFormSelectExecutionEnvironment instead */
export function PageFormExecutionEnvironmentSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  executionEnvironmentPath?: string;
  executionEnvironmentIdPath?: string;
  organizationId?: string;
  additionalControls?: ReactElement;
  isRequired?: boolean;
  label?: string;
  placeholder?: string;
  isDisabled?: boolean;
  // tooltip?: string;
}) {
  const {
    name,
    organizationId,
    executionEnvironmentIdPath,
    executionEnvironmentPath,
    placeholder,
    ...rest
  } = props;
  const { t } = useTranslation();
  const selectExecutionEnvironment = useSelectExecutionEnvironments(organizationId ?? undefined);
  const { setValue } = useFormContext();
  return (
    // <Tooltip content={props.tooltip} trigger={props.tooltip ? undefined : 'manual'}>
    <PageFormTextInput<TFieldValues, TFieldName, ExecutionEnvironment>
      {...rest}
      label={props.label ?? t('Execution environment')}
      name={name}
      id="execution-environment-select"
      placeholder={placeholder ?? t('Select execution environment')}
      labelHelpTitle={t('Execution environment')}
      labelHelp={t('The container image to be used for execution.')}
      selectTitle={t('Select an execution environment')}
      selectValue={(executionEnvironment: ExecutionEnvironment) => executionEnvironment.name}
      selectOpen={selectExecutionEnvironment}
      validate={async (executionEnvironmentName: string) => {
        if (!executionEnvironmentName && !props.isRequired) {
          return undefined;
        }
        try {
          const itemsResponse = await requestGet<AwxItemsResponse<ExecutionEnvironment>>(
            awxAPI`/execution_environments/?name=${executionEnvironmentName}`
          );
          if (itemsResponse.results.length === 0) return t('Execution environment not found.');
          if (executionEnvironmentPath)
            setValue(executionEnvironmentPath, itemsResponse.results[0]);
          if (executionEnvironmentIdPath)
            setValue(executionEnvironmentIdPath, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
    // </Tooltip>
  );
}
