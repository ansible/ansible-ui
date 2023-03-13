import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Organization } from '../../../interfaces/Organization';
import { useSelectOrganization } from '../hooks/useSelectOrganization';

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
