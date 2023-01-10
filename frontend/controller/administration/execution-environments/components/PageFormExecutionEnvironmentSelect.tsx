import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectExecutionEnvironments } from '../hooks/useSelectExecutionEnvironments';

export function PageFormExecutionEnvironmentSelect(props: {
  name: string;
  executionEnvironmentPath?: string;
  executionEnvironmentIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectExecutionEnvironment = useSelectExecutionEnvironments();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Inventory')}
      placeholder="Enter executionEnvironment"
      selectTitle={t('Select an inventory')}
      selectValue={(executionEnvironment: ExecutionEnvironment) => executionEnvironment.name}
      selectOpen={selectExecutionEnvironment}
      validate={async (inventoryName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Inventory>>(
            `/api/v2/inventories/?name=${inventoryName}`
          );
          if (itemsResponse.results.length === 0) return t('Job inventory not found.');
          if (props.executionEnvironmentPath)
            setValue(props.executionEnvironmentPath, itemsResponse.results[0]);
          if (props.executionEnvironmentIdPath)
            setValue(props.executionEnvironmentIdPath, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
      isRequired
    />
  );
}
