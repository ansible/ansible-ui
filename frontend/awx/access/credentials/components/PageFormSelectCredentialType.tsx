import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../common/api/awx-utils';
import { useCredentialTypesFilters } from '../../credential-types/hooks/useCredentialTypesFilters';
import { useCredentialTypesColumns } from '../../credential-types/hooks/useCredentialTypesColumns';
import { CredentialType } from '../../../interfaces/CredentialType';

/**
 * A form input for selecting an credential type.
 *
 * @example
 * ```tsx
 * <PageFormSelectCredentialType name="credential_type" />
 * ```
 */
export function PageFormSelectCredentialType<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const toolbarFilters = useCredentialTypesFilters();
  const tableColumns = useCredentialTypesColumns();
  return (
    <PageFormSingleSelectAwxResource<CredentialType, TFieldValues, TFieldName>
      name={props.name}
      id="credential_type"
      label={t('Credential type')}
      placeholder={t('Select credential type')}
      queryPlaceholder={t('Loading credential types...')}
      queryErrorText={t('Error loading credential types')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/credential_types/`}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
    />
  );
}
