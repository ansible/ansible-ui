import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectExecutionEnvironments } from '../hooks/useSelectExecutionEnvironments';

export function PageFormExecutionEnvironmentSelect(props: {
  name: string;
  label?: string;
  isRequired?: boolean;
  executionEnvironmentPath?: string;
  executionEnvironmentIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectExecutionEnvironment = useSelectExecutionEnvironments();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={props.label || t('Execution environment')}
      placeholder={t('Enter execution environment')}
      selectTitle={t('Select an execution environment')}
      selectValue={(executionEnvironment: ExecutionEnvironment) => executionEnvironment.name}
      selectOpen={selectExecutionEnvironment}
      validate={async (executionEnvironmentName: string) => {
        if (!executionEnvironmentName && !props.isRequired) {
          return undefined;
        }
        try {
          const itemsResponse = await requestGet<ItemsResponse<Inventory>>(
            `/api/v2/execution_environments/?name=${executionEnvironmentName}`
          );
          if (itemsResponse.results.length === 0) return t('Execution environment not found.');
          if (props.executionEnvironmentPath) {
            setValue(props.executionEnvironmentPath, itemsResponse.results[0]);
          }
          if (props.executionEnvironmentIdPath) {
            setValue(props.executionEnvironmentIdPath, itemsResponse.results[0].id);
          }
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
