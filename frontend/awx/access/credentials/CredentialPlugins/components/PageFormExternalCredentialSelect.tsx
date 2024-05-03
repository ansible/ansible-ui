import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectAwxResource } from '../../../../common/PageFormSingleSelectAwxResource';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useCredentialsFilters } from '../../hooks/useCredentialsFilters';
import { useCredentialsColumns } from '../../hooks/useCredentialsColumns';
import { Credential } from '../../../../interfaces/Credential';
/**
 * A form input for selecting an external credential.
 *
 * @example
 * ```tsx
 * <PageFormExternalCredentialSelect<Credential> name="source_credential" />
 * ```
 */
export function PageFormExternalCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const credentialColumns = useCredentialsColumns({ disableLinks: true });
  const credentialFilters = useCredentialsFilters();
  return (
    <PageFormSingleSelectAwxResource<Credential, TFieldValues, TFieldName>
      name={props.name}
      id="credential"
      label={t('Credential')}
      placeholder={t('Select credential')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={awxAPI`/credentials/`}
      queryParams={{ credential_type__kind: 'external' }}
      tableColumns={credentialColumns}
      toolbarFilters={credentialFilters}
    />
  );
}
