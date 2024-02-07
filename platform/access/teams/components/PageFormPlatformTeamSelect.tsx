import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useSelectTeam } from '../hooks/useSelectTeam';

export function PageFormPlatformTeamSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectTeam();
  const query = useCallback(async () => {
    const response = await requestGet<PlatformItemsResponse<PlatformTeam>>(
      gatewayAPI`/teams/`.concat(`?page_size=200`)
    );
    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);
  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="team"
      label={t('Team')}
      query={query}
      valueToString={(value) => (value as PlatformTeam)?.name ?? ''}
      placeholder={t('Select team')}
      loadingPlaceholder={t('Loading teams...')}
      loadingErrorText={t('Error loading teams')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
