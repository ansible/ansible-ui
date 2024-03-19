import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformUser } from '../../../interfaces/PlatformUser';

export function PageFormPlatformUsersSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<PlatformUser, 'username', 'id'>({
    url: gatewayAPI`/users/`,
    labelKey: 'username',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  return (
    <PageFormAsyncMultiSelect<TFieldValues, TFieldName>
      name={props.name}
      id="users"
      label={t('Users')}
      placeholder={t('Select users')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading users...')}
      queryErrorText={t('Error loading users')}
      queryLabel={(id: number) => (
        <AsyncQueryLabel id={id} url={gatewayAPI`/users/`} field="username" />
      )}
      isRequired={props.isRequired}
    />
  );
}
