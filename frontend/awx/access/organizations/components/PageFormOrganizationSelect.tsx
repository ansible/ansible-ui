import { useCallback } from 'react';
import { FieldPath, FieldPathValue, FieldValues, Path, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Organization } from '../../../interfaces/Organization';
import { useSelectOrganization, useSelectOrganization2 } from '../hooks/useSelectOrganization';

export function PageFormOrganizationSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: { name: TFieldName; organizationPath?: string; organizationIdPath?: string }) {
  const { t } = useTranslation();
  const selectOrganization = useSelectOrganization();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput<TFieldValues, TFieldName, Organization>
      name={props.name}
      label={t('Organization')}
      placeholder={t('Enter organization')}
      selectTitle={t('Select a organization')}
      selectValue={(organization: Organization) => organization.name}
      selectOpen={selectOrganization}
      validate={async (organizationName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Organization>>(
            `/api/v2/organizations/?name=${organizationName}`
          );
          if (itemsResponse.results.length === 0) return t('Organization not found.');
          if (props.organizationPath) setValue(props.organizationPath, itemsResponse.results[0]);
          if (props.organizationIdPath)
            setValue(props.organizationIdPath, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error)
            return t('Error validating organization: {{errMessage}}. Please reload the page.', {
              errMessage: err.message,
            });
          else return t('Error validating organization. Please reload the page.');
        }
        return undefined;
      }}
      isRequired
    />
  );
}

export function PageFormSelectOrganization<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: { name: TFieldName; isRequired?: boolean }) {
  const { t } = useTranslation();
  const openSelectDialog = useSelectOrganization2();
  const query = useCallback(async () => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // throw new Error('Error');
    const response = await requestGet<ItemsResponse<Organization>>(
      `/api/v2/organizations/?limit=200`
    );
    return Promise.resolve({
      total: response.count,
      values: response.results as FieldPathValue<TFieldValues, Path<TFieldValues>>[],
    });
  }, []);
  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      label={t('Organization')}
      query={query}
      valueToString={(value) => (value as Organization)?.name ?? ''}
      placeholder={t('Select organization')}
      loadingPlaceholder={t('Loading organizations...')}
      isRequired={props.isRequired}
      limit={200}
      openSelectDialog={openSelectDialog}
    />
  );
}
