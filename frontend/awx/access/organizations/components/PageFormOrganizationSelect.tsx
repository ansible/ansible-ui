import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';

export function PageFormSelectOrganization<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean }) {
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
      url={awxAPI`/organizations/`}
      tableColumns={organizationColumns}
      toolbarFilters={organizationFilters}
    />
  );
}
