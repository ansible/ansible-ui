import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

export function PageFormPlatformOrganizationsSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<PlatformOrganization, 'name', 'id'>({
    url: gatewayAPI`/organizations/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  return (
    <PageFormAsyncMultiSelect<TFieldValues, TFieldName>
      name={props.name}
      id="organizations"
      label={t('Organizations')}
      placeholder={t('Select organizations')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      queryLabel={(id: number) => <AsyncQueryLabel id={id} url={gatewayAPI`/organizations/`} />}
      isRequired={props.isRequired}
    />
  );
}
