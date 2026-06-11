import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { useCallback } from 'react';
import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function PageFormPlatformOrganizationNameSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: Readonly<{ name: TFieldName; isRequired?: boolean }>) {
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
      labelHelp={t('Specify the organization that matching users are added to or barred from. ')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      queryLabel={(name: string) => name}
      isRequired={props.isRequired}
      writeInOption={writeInOption}
    />
  );
}
