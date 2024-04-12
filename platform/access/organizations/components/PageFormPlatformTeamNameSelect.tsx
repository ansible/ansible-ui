import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '../../../../framework/PageInputs/PageAsyncSelectOptions';
import { AsyncQueryLabel } from '../../../../framework/components/AsyncQueryLabel';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function PageFormPlatformTeamNameSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, number> = FieldPathByValue<
    TFieldValues,
    number
  >,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const queryOptions = useQueryPlatformOptions<PlatformTeam, 'name', 'name'>({
    url: gatewayAPI`/teams/`,
    labelKey: 'name',
    valueKey: 'name',
    orderQuery: 'order_by',
  });
  return (
    <PageFormAsyncSingleSelect<TFieldValues, TFieldName>
      name={props.name}
      id="team"
      label={t('Team')}
      placeholder={t('Select team')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading teams...')}
      queryErrorText={t('Error loading teams')}
      queryLabel={(id: number) => <AsyncQueryLabel id={id} url={gatewayAPI`/teams/`} />}
      isRequired={props.isRequired}
    />
  );
}
