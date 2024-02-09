import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { useSelectOrganization } from '../hooks/useSelectOrganization';

export function PageFormSelectOrganization<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectOrganization();
  const query = useCallback(async () => {
    const response = await requestGet<AwxItemsResponse<Organization>>(
      awxAPI`/organizations/`.concat(`?page_size=200`)
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
      valueToString={(value) => (value as Organization)?.name ?? ''}
      placeholder={t('Select organization')}
      loadingPlaceholder={t('Loading organizations...')}
      loadingErrorText={t('Error loading organizations')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
