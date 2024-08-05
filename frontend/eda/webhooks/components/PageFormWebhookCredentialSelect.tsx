import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';
import { useCredentialColumns } from '../../access/credentials/hooks/useCredentialColumns';
import { useCredentialFilters } from '../../access/credentials/hooks/useCredentialFilters';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { edaAPI } from '../../common/eda-utils';

/**
 * A form input for selecting an Credential.
 *
 * @example
 * ```tsx
 * <PageFormSelectCredential<Credential> name="Credential" />
 * ```
 */
export function PageFormSelectWebhookCredential<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  type: string;
  isRequired?: boolean;
  isDisabled?: string;
  helperText?: string;
}) {
  const { t } = useTranslation();
  const CredentialColumns = useCredentialColumns();
  const CredentialFilters = useCredentialFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaCredential, TFieldValues, TFieldName>
      name={props.name}
      id="credential_id"
      label={t('Credential')}
      placeholder={t('Select Credential')}
      queryPlaceholder={t('Loading Credentials...')}
      queryErrorText={t('Error loading Credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/eda-credentials/`}
      queryParams={{ credential_type__kind: props?.type }}
      tableColumns={CredentialColumns}
      toolbarFilters={CredentialFilters}
    />
  );
}
