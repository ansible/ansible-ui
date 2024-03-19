import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncMultiSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function PageFormPlatformTeamsSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number[]> = FieldPathByValue<
    TFieldValues,
    number[]
  >,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<PlatformTeam, 'name', 'id'>({
    url: gatewayAPI`/teams/`,
    labelKey: 'name',
    valueKey: 'id',
    orderQuery: 'order_by',
  });
  return (
    <PageFormAsyncMultiSelect<TFieldValues, TFieldName>
      name={props.name}
      id="teams"
      label={t('Teams')}
      placeholder={t('Select teams')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading teams...')}
      queryErrorText={t('Error loading teams')}
      queryLabel={(id: number) => <AsyncQueryLabel id={id} url={gatewayAPI`/teams/`} />}
      isRequired={props.isRequired}
    />
  );
}
