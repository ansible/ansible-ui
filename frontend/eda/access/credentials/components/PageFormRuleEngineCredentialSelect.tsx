import { FieldPath, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../../common/PageFormSingleSelectEdaResource';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useCredentialColumns } from '../hooks/useCredentialColumns';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { EdaItemsResponse } from '../../../common/EdaItemsResponse';
import { EDA_MAX_PAGE_SIZE } from '../../../common/eda-constants';

export function PageFormRuleEngineCredentialSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string }) {
  const { t } = useTranslation();
  const credentialColumns = useCredentialColumns({ disableLinks: true });
  const { setValue, watch } = useFormContext<TFieldValues>();
  const currentValue = watch(props.name);

  // Track if auto-select has run to prevent it from running on every empty state
  const hasAutoSelectedRef = useRef(false);

  // Memoize queryParams to prevent recreating the object on every render
  // (which would cause the dropdown to refetch continuously)
  const queryParams = useMemo(
    () => ({
      credential_type__namespace__in: 'drools',
      page_size: EDA_MAX_PAGE_SIZE.toString(),
    }),
    []
  );

  // Fetch credentials to check count and find managed credential
  // Disable automatic revalidation to prevent refetching on dropdown open/focus
  const { data: credentialsData, isLoading } = useGet<EdaItemsResponse<EdaCredential>>(
    edaAPI`/eda-credentials/`,
    queryParams,
    {
      refreshInterval: 0, // Disable periodic refresh
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
      dedupingInterval: 60000, // Cache for 60 seconds
    }
  );

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
      if (!credential.description) {
        return '';
      }
      const periodIndex = credential.description.indexOf('.');
      return credential.description.slice(0, periodIndex === -1 ? undefined : periodIndex);
    },
    [t]
  );

  // Auto-select the managed credential ONLY on initial mount if no value is set
  // Do NOT run auto-select when user clears the field (for required fields, clear button is hidden anyway)
  useEffect(() => {
    if (!hasAutoSelectedRef.current && !currentValue && credentialsData?.results) {
      const managedCredential = credentialsData.results.find((cred) => cred.managed);
      if (managedCredential) {
        setValue(props.name, managedCredential.id as never, {
          shouldValidate: false,
          shouldDirty: false,
        });
      }
      // Mark auto-select as attempted regardless of whether we found a managed credential
      hasAutoSelectedRef.current = true;
    }
  }, [currentValue, credentialsData, setValue, props.name]);

  // Only show helper text when there are no credentials (and data has loaded)
  const hasCredentials = !isLoading && (credentialsData?.count ?? 0) > 0;
  const shouldShowHelperText = !isLoading && !hasCredentials;

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
      queryParams={queryParams}
      tableColumns={credentialColumns}
      toolbarFilters={eventPersistenceCredentialsFilter}
      getOptionDescription={getOptionDescription}
      helperText={
        shouldShowHelperText
          ? t(
              'Create an Ansible Rule Engine credential in the Credentials page to populate this list.'
            )
          : undefined
      }
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
