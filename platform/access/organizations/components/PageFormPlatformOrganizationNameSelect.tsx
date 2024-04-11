import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';

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
  return (
    <PageFormAsyncSingleSelect<TFieldValues, TFieldName>
      name={props.name}
      id="organization"
      label={t('Organization')}
      placeholder={t('Select organization')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      queryLabel={(id: number) => <AsyncQueryLabel id={id} url={gatewayAPI`/organizations/`} />}
      isRequired={props.isRequired}
    />
  );
}
