import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../../common/PageFormSingleSelectEdaResource';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';

import { edaAPI } from '../../../common/eda-utils';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { useOrganizationsFilters } from '../hooks/useOrganizationsFilters';

/**
 * A form input for selecting an organization.
 *
 * @example
 * ```tsx
 * <PageFormSelectOrganization<Credential> name="organization" />
 * ```
 */
export function PageFormSelectOrganization<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const organizationColumns = useOrganizationColumns();
  const organizationFilters = useOrganizationsFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaOrganization, TFieldValues, TFieldName>
      name={props.name}
      id="organization_id"
      label={t('Organization')}
      placeholder={t('Select organization')}
      queryPlaceholder={t('Loading organizations...')}
      queryErrorText={t('Error loading organizations')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/organizations/`}
      tableColumns={organizationColumns}
      toolbarFilters={organizationFilters}
    />
  );
}
