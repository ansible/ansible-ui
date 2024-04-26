import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';

/**
 * A form input for selecting an organization.
 *
 * @example
 * ```tsx
 * <PageFormSelectOrganization<Organization> name="organization" />
 * ```
 */
export function PageFormSelectOrganization<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const organizationColumns = useOrganizationsColumns({ disableLinks: true });
  const organizationFilters = useOrganizationsFilters();
  return (
    <PageFormSingleSelectAwxResource<Organization, TFieldValues, TFieldName>
      name={props.name}
      id="organization"
      label={t('Organization')}
      placeholder={t('Select organization')}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/organizations/`}
      tableColumns={organizationColumns}
      toolbarFilters={organizationFilters}
    />
  );
}
