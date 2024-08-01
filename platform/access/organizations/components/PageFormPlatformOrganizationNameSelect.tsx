import { useCallback } from 'react';
import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';

export function PageFormPlatformOrganizationNameSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<PlatformOrganization, 'name', 'name'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'name',
    orderQuery: 'order_by',
  });
  const writeInOption = useCallback(
    (searchString: string) =>
      ({
        label: searchString,
        value: searchString,
      }) as PageSelectOption<PathValue<TFieldValues, TFieldName>>,
    []
  );

  return (
    <PageFormAsyncSingleSelect<TFieldValues, TFieldName>
      name={props.name}
      id="organization"
      label={t('Organization')}
      placeholder={t('Select organization')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      queryLabel={(name: string) => name}
      isRequired={props.isRequired}
      writeInOption={writeInOption}
    />
  );
}
