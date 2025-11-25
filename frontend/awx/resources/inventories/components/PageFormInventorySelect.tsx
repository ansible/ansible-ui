import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoriesColumns } from '../hooks/useInventoriesColumns';
import { useInventoriesFilters } from '../hooks/useInventoriesFilters';

export function PageFormInventorySelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: Readonly<{
    name: TFieldName;
    isRequired?: boolean;
    isDisabled?: string;
    helperText?: string;
    labelHelp?: string;
    isNotConstructedInventory?: boolean;
    additionalControls?: React.ReactNode;
  }>
) {
  const { t } = useTranslation();
  const columns = useInventoriesColumns({ disableLinks: true });
  const filters = useInventoriesFilters();
  const url = props.isNotConstructedInventory
    ? awxAPI`/inventories/?not__kind=constructed`
    : awxAPI`/inventories/`;
  return (
    <PageFormSingleSelectAwxResource<Inventory, TFieldValues, TFieldName>
      name={props.name}
      id="inventory"
      label={t('Inventory')}
      placeholder={t('Select inventory')}
      queryPlaceholder={t('Loading inventories...')}
      queryErrorText={t('Error loading inventories')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      labelHelp={props.labelHelp}
      url={url}
      tableColumns={columns}
      toolbarFilters={filters}
      additionalControls={props.additionalControls}
      summaryFieldsPath={'inventory'}
    />
  );
}
