import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { useInventorySourceColumns } from '../hooks/useInventorySourceColumns';
import { useInventorySourceFilters } from '../hooks/useInventorySourceFilters';

export function PageFormInventorySourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; inventoryId?: number }) {
  const { name, inventoryId, isRequired = false } = props;
  const { t } = useTranslation();
  const columns = useInventorySourceColumns();
  const filters = useInventorySourceFilters();
  return (
    <PageFormSingleSelectAwxResource<InventorySource, TFieldValues, TFieldName>
      name={name}
      tableColumns={columns}
      toolbarFilters={filters}
      id="inventory-source-select"
      label={t('Inventory source')}
      placeholder={t('Select inventory source')}
      queryPlaceholder={t('Loading inventory sources...')}
      queryErrorText={t('Error loading inventory sources')}
      isRequired={isRequired}
      url={
        inventoryId === null || inventoryId === undefined
          ? awxAPI`/inventory_sources/?page_size=200`
          : awxAPI`/inventories/${inventoryId.toString()}/inventory_sources/?page_size=200`
      }
    />
  );
}
