import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectInventory } from '../hooks/useSelectInventory';

export function PageFormInventorySelect(props: {
  name: string;
  inventoryPath?: string;
  inventoryIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectInventory = useSelectInventory();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Inventory')}
      placeholder="Enter inventory"
      selectTitle={t('Select an inventory')}
      selectValue={(inventory: Inventory) => inventory.name}
      selectOpen={selectInventory}
      validate={async (inventoryName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Inventory>>(
            `/api/v2/inventories/?name=${inventoryName}`
          );
          if (itemsResponse.results.length === 0) return t('Job inventory not found.');
          if (props.inventoryPath) setValue(props.inventoryPath, itemsResponse.results[0]);
          if (props.inventoryIdPath) setValue(props.inventoryIdPath, itemsResponse.results[0].id);
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
