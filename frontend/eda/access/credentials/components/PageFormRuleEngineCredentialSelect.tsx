import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../../common/PageFormSingleSelectEdaResource';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from '../hooks/useCredentialColumns';
import { useCallback, useMemo } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';

export function PageFormRuleEngineCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string }) {
  const { t } = useTranslation();
  const credentialColumns = useCredentialColumns({ disableLinks: true });

  const eventPersistenceCredentialsFilter = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );

  const getOptionDescription = useCallback(
    (credential: EdaCredential) => {
      if (credential.managed) {
        return t('Default credential provided by the database at install');
      }
      return credential.description
        ? credential.description.slice(
            0,
            credential.description.indexOf('.') || credential.description.length
          )
        : '';
    },
    [t]
  );

  return (
    <PageFormSingleSelectEdaResource<EdaCredential, TFieldValues, TFieldName>
      name={props.name}
      id="rule-engine-credential-select"
      label={t('Event persistence credential')}
      placeholder={t('Select an event persistence credential')}
      queryPlaceholder={t('Loading credentials...')}
      queryErrorText={t('Error loading credentials')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      url={edaAPI`/eda-credentials/`}
      queryParams={{ credential_type__namespace__in: 'drools' }}
      tableColumns={credentialColumns}
      toolbarFilters={eventPersistenceCredentialsFilter}
      getOptionDescription={getOptionDescription}
      helperText={t(
        'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
      )}
      labelHelp={
        <>
          <p>{t('Credential the Ansible Rule Engine uses for the event persistence database.')}</p>
          <br />
          <p>
            {t(
              'If using the platform-provided database, the default credential is selected automatically. You can select a different credential you created instead. If using an external database, select a credential you created.'
            )}
          </p>
        </>
      }
    />
  );
}
