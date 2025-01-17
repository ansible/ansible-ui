import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageAsyncSelectOptionsFn } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { useCallback } from 'react';
import { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryPlatformOptions } from '../../../common/useQueryPlatformOptions';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

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
      id="team"
      label={t('Team')}
      labelHelp={t('Specify the team that matching users are added to or barred from.')}
      placeholder={t('Select team')}
      queryOptions={queryOptions as PageAsyncSelectOptionsFn<PathValue<TFieldValues, TFieldName>>}
      queryPlaceholder={t('Loading teams...')}
      queryErrorText={t('Error loading teams')}
      queryLabel={(name: string) => name}
      isRequired={props.isRequired}
      writeInOption={writeInOption}
    />
  );
}
