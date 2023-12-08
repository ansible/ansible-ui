import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useSelectInventorySource } from '../hooks/useSelectInventorySource';

export function PageFormInventorySourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; inventoryId?: number }) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectInventorySource();
  const query = useCallback(async () => {
    const url = props.inventoryId
      ? awxAPI`/inventories/${props.inventoryId.toString()}/inventory_sources/`.concat(
          `?page_size=200`
        )
      : awxAPI`/inventory_sources/`.concat(`?page_size=200`);
    const response = await requestGet<AwxItemsResponse<InventorySource>>(url);
    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, [props.inventoryId]);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="inventory-source-select"
      label={t('Inventory source')}
      query={query}
      valueToString={(value) => {
        return (value as InventorySource)?.name ?? '';
      }}
      placeholder={t('Select inventory source')}
      loadingPlaceholder={t('Loading inventory sources...')}
      loadingErrorText={t('Error loading inventory sources')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
