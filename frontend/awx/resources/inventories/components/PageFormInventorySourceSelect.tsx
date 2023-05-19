import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useSelectInventorySource } from '../hooks/useSelectInventorySource';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';

export function PageFormInventorySourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  inventorySourceIdPath?: string;
  inventoryId: number;
}) {
  const { t } = useTranslation();
  const { clearErrors, setError, getFieldState, formState } = useFormContext();
  const openSelectDialog = useSelectInventorySource();
  const query = useCallback(async () => {
    const { error } = getFieldState(props.name, formState);
    if (error) {
      clearErrors(props.name);
    }
    const response = await requestGet<ItemsResponse<InventorySource>>(
      `/api/v2/inventories/${props.inventoryId.toString()}/inventory_sources/?page_size=200`
    );

    if (response.count === 0)
      setError(props.name, {
        message: t(
          'The selected inventory has no inventory sources associated with it.  Select an inventory with inventory sources.'
        ),
      });

    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, [props.inventoryId, t, props.name, setError, formState, clearErrors, getFieldState]);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      label={t('Inventory source')}
      query={query}
      valueToString={(value) => (value as InventorySource)?.name ?? ''}
      placeholder={t('Select inventory source')}
      loadingPlaceholder={t('Loading inventory sources...')}
      loadingErrorText={t('Error loading inventory sources')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
