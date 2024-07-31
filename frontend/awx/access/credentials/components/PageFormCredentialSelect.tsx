import { ReactElement } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { PageFormSingleSelectAwxResource } from '../../../common/PageFormSingleSelectAwxResource';
import { useCredentialsColumns } from '../hooks/useCredentialsColumns';
import { useCredentialsFilters } from '../hooks/useCredentialsFilters';
import { QueryParams } from '../../../common/useAwxView';
import { PageFormMultiSelectAwxResource } from '../../../common/PageFormMultiSelectAwxResource';
import { useCredentialsValidate } from '../hooks/useCredentialsValidate';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  additionalControls?: ReactElement;
  credentialIdPath?: string;
  credentialPath?: string;
  credentialType?: number;
  id?: string;
  isDisabled?: string;
  isMultiple?: boolean;
  isRequired?: boolean;
  label?: string;
  labelHelp?: string;
  labelHelpTitle?: string;
  placeholder?: string;
  selectTitle?: string;
  sourceType?: string;
  queryParams?: QueryParams;
}) {
  const { t } = useTranslation();

  const credentialColumns = useCredentialsColumns({ disableLinks: true });
  const credentialFilters = useCredentialsFilters();
  const validateCredentials = useCredentialsValidate();

  return props.isMultiple ? (
    <PageFormMultiSelectAwxResource<Credential>
      name={props.name}
      id={props.id ? props.id : 'credential'}
      label={props.label ? props.label : t('Credential')}
      placeholder={props.placeholder ? props.placeholder : t('Select credentials')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      labelHelp={props.labelHelp}
      url={awxAPI`/credentials/`}
      tableColumns={credentialColumns}
      toolbarFilters={credentialFilters}
      queryParams={props.queryParams}
      additionalControls={props.additionalControls}
      compareOptionValues={(currentCredential: Credential, selectCredential: Credential) =>
        currentCredential.id === selectCredential.id
      }
      validate={validateCredentials}
      formatLabel={(credential: Credential) => {
        return `${credential.name} | ${credential.summary_fields.credential_type.name}`;
      }}
    />
  ) : (
    <PageFormSingleSelectAwxResource<Credential, TFieldValues, TFieldName>
      name={props.name}
      id={props.id ? props.id : 'credential'}
      label={props.label ? props.label : t('Credential')}
      placeholder={props.placeholder ? props.placeholder : t('Select credential')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      labelHelp={props.labelHelp}
      url={awxAPI`/credentials/`}
      tableColumns={credentialColumns}
      toolbarFilters={credentialFilters}
      queryParams={props.queryParams}
      additionalControls={props.additionalControls}
    />
  );
}
