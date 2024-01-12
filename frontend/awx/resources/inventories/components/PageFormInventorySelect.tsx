import { ReactElement, ReactNode, useCallback } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { useSelectInventory } from '../hooks/useSelectInventory';

export function PageFormInventorySelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  isRequired?: boolean;
  additionalControls?: ReactElement;
  labelHelp?: string | string[] | ReactNode;
}) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectInventory();
  const query = useCallback(async () => {
    const response = await requestGet<AwxItemsResponse<Inventory>>(
      awxAPI`/inventories/`.concat(`?page_size=200`)
    );
    return Promise.resolve({
      total: response.count,
      values: response.results,
    });
  }, []);
  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="inventory"
      variant="typeahead"
      additionalControls={props.additionalControls}
      label={t('Inventory')}
      query={query}
      valueToString={(value) => (value as Inventory)?.name ?? ''}
      placeholder={t('Select inventory')}
      labelHelpTitle={t('Inventory')}
      labelHelp={
        props.labelHelp ??
        t('Select the inventory containing the playbook you want this job to execute.')
      }
      loadingPlaceholder={t('Loading inventories...')}
      loadingErrorText={t('Error loading inventories')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
