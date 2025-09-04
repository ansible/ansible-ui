import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { PageFormMultiSelectEdaResource } from '../../../common/PageFormMultiSelectEdaResource';
import { edaAPI } from '../../../common/eda-utils';
import { useCredentialColumns } from '../hooks/useCredentialColumns';
import { useCredentialFilters } from '../hooks/useCredentialFilters';

export function PageFormCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  labelHelp: string;
  isRequired?: boolean;
  credentialKinds?: string[];
}) {
  const { t } = useTranslation();
  const credentialColumns = useCredentialColumns({ disableLinks: true });
  const credentialFilters = useCredentialFilters();

  // Build query params based on credential kinds if provided
  const queryParams = props.credentialKinds
    ? { credential_type__kind__in: props.credentialKinds.join(',') }
    : undefined;

  return (
    <PageFormMultiSelectEdaResource<EdaCredential>
      name={props.name}
      id="credential-select"
      label={t('Credential')}
      placeholder={t('Select credentials')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      labelHelp={props.labelHelp}
      url={edaAPI`/eda-credentials/`}
      tableColumns={credentialColumns}
      toolbarFilters={credentialFilters}
      queryParams={queryParams}
      compareOptionValues={(currentCredential: EdaCredential, selectCredential: EdaCredential) =>
        currentCredential.id === selectCredential.id
      }
      validate={(credentials: EdaCredential[]) => {
        if (props.isRequired && credentials.length === 0) {
          return Promise.resolve(t('Credential is required.'));
        }
        return Promise.resolve(undefined);
      }}
      formatLabel={(credential: EdaCredential) => {
        return `${credential.name} | ${credential.credential_type?.name || t('Unknown type')}`;
      }}
      disableClearChips={false}
      disableClearSelection={false}
    />
  );
}
