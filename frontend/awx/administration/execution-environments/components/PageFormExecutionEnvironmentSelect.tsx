import { ReactElement } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useSelectExecutionEnvironments } from '../hooks/useSelectExecutionEnvironments';

export function PageFormExecutionEnvironmentSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  executionEnvironmentPath?: string;
  executionEnvironmentIdPath?: string;
  organizationId?: string;
  additionalControls?: ReactElement;
  isRequired?: boolean;
  label?: string;
}) {
  const { name, organizationId, executionEnvironmentIdPath, executionEnvironmentPath, ...rest } =
    props;
  const { t } = useTranslation();
  const selectExecutionEnvironment = useSelectExecutionEnvironments(organizationId ?? undefined);
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput<TFieldValues, TFieldName, ExecutionEnvironment>
      {...rest}
      label={props.label ?? t('Execution environment')}
      name={name}
      placeholder={t('Add execution environment')}
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
          const itemsResponse = await requestGet<ItemsResponse<ExecutionEnvironment>>(
            `/api/v2/execution_environments/?name=${executionEnvironmentName}`
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
  );
}
