import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../frontend/common/crud/Data';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { useSelectOrganization } from '../hooks/useSelectOrganization';

export function PageFormPlatformOrganizationSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectOrganization();
  const query = useCallback(async () => {
    const response = await requestGet<PlatformItemsResponse<PlatformOrganization>>(
      gatewayAPI`/organizations/`.concat(`?page_size=200`)
    );
    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);
  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="organization"
      label={t('Organization')}
      query={query}
      valueToString={(value) => (value as PlatformOrganization)?.name ?? ''}
      placeholder={t('Select organization')}
      loadingPlaceholder={t('Loading organizations...')}
      loadingErrorText={t('Error loading organizations')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
