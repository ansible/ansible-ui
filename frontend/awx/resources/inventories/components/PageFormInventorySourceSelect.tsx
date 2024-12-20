import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from '../hooks/useInventorySourceColumns';
import { useInventorySourceFilters } from '../hooks/useInventorySourceFilters';

export function PageFormInventorySourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; inventoryId?: number }) {
  const { t } = useTranslation();

  const query =
    props.inventoryId === null || props.inventoryId === undefined
      ? awxAPI`/inventory_sources/`
      : awxAPI`/inventories/${props.inventoryId.toString()}/inventory_sources/?page_size=200`;

  return (
    <PageFormSingleSelectAwxResource<InventorySource, TFieldValues>
      name={props.name}
      id="inventory-source-select"
      label={t('Inventory source')}
      url={query}
      placeholder={t('Select inventory source')}
      queryPlaceholder={t('Loading inventory sources...')}
      queryErrorText={t('Error loading inventory sources')}
      isRequired={props.isRequired}
      toolbarFilters={useInventorySourceFilters()}
      tableColumns={useInventorySourceColumns({ disableLinks: true })}
    />
  );
}
