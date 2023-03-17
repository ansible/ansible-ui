import { ReactElement, useEffect } from 'react';
import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectInventory } from '../hooks/useSelectInventory';

export function PageFormInventorySelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  inventoryPath: string;
  inventoryIdPath?: string;
  isRequired?: boolean;
  additionalControls?: ReactElement;
}) {
  const { inventoryPath, inventoryIdPath, name, ...rest } = props;
  const { t } = useTranslation();
  const {
    useSelectDialog: selectInventory,
    view: { pageItems, selectItem },
  } = useSelectInventory();

  const { setValue } = useFormContext();
  useEffect(() => {
    if (pageItems?.length === 1) {
      setValue(name as string, pageItems[0]?.name);
      setValue(inventoryPath, pageItems[0]);
      setValue(inventoryIdPath as string, pageItems[0].id);
      selectItem(pageItems[0]);
    }
  }, [inventoryPath, selectItem, inventoryIdPath, pageItems, name, setValue]);
  return (
    <PageFormTextInput<TFieldValues, TFieldName, Inventory>
      {...rest}
      name={name}
      additionalControls={props.additionalControls}
      isRequired={props.isRequired}
      labelHelpTitle={t('Inventory')}
      labelHelp={t('Select the inventory containing the hosts you want this job to manage.')}
      label={t('Inventory')}
      placeholder={t('Enter inventory')}
      selectTitle={t('Select an inventory')}
      selectValue={(inventory: Inventory) => inventory.name}
      selectOpen={selectInventory}
      validate={async (inventoryName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Inventory>>(
            `/api/v2/inventories/?name=${inventoryName}`
          );
          if (itemsResponse.results.length === 0) return t('Inventory not found.');
          if (inventoryPath) setValue(inventoryPath, itemsResponse.results[0]);
          if (inventoryIdPath) setValue(inventoryIdPath, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
    />
  );
}
