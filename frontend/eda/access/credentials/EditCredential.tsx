import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { Alert, Button } from '@patternfly/react-core';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useSWRConfig } from 'swr';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredential, EdaCredentialCreate } from '../../interfaces/EdaCredential';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { EdaResult } from '../../interfaces/EdaResult';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import { useCredentialsTestModal } from './hooks/useCredentialsTestModal';
import { CredentialPluginsInputSource } from './hooks/useCredentialSecretModal';
import { CredentialInputs, EdaCredentialTypes } from './CredentialInputs';
import { CredentialDetails } from './CredentialPage/CredentialDetails';

export function EditCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/eda-credentials/${params.id ?? ''}/`
  );
  const canPatchCredential = data ? Boolean(data.actions?.['PATCH']) : true;
  const { data: credential } = useGet<EdaCredential>(edaAPI`/eda-credentials/${id.toString()}/`);
  const openCredentialsExternalTestModal = useCredentialsTestModal();
  const [isTestButtonEnabled, setIsTestButtonEnabled] = useState(false);
  const [isTestButtonEnabledSubForm, setIsTestButtonEnabledSubForm] = useState(false);
  const [watchedSubFormFields, setWatchedSubFormFields] = useState<unknown[]>([]);
  const [credentialPluginValues, setCredentialPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [accumulatedPluginValues, setAccumulatedPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [hasInitializedPluginValues, setHasInitializedPluginValues] = useState(false);
  const { data: credentialTypes } = useGet<EdaResult<EdaCredentialType>>(
    edaAPI`/credential-types/?page=1&page_size=200`
  );

  const { data: credentialInputSourcesResponse } = useGet<EdaResult<CredentialPluginsInputSource>>(
    credential?.id
      ? edaAPI`/credential-input-sources/?target_credential=${credential.id}`
      : undefined
  );

  const credentialInputSources = useMemo(() => {
    return credentialInputSourcesResponse?.results || [];
  }, [credentialInputSourcesResponse]);

  const filterAndMergePluginValues = useCallback(
    (prev: CredentialPluginsInputSource[]) => {
      const filteredPrev = prev.filter(
        (prevValue) =>
          !credentialPluginValues.some(
            (newValue) => newValue.input_field_name === prevValue.input_field_name
          )
      );
      return [...filteredPrev, ...credentialPluginValues];
    },
    [credentialPluginValues]
  );

  useEffect(() => {
    setAccumulatedPluginValues(filterAndMergePluginValues);
  }, [filterAndMergePluginValues]);

  useEffect(() => {
    if (credentialInputSources.length > 0 && !hasInitializedPluginValues) {
      setAccumulatedPluginValues(credentialInputSources);
      setHasInitializedPluginValues(true);
    }
  }, [credentialInputSources, hasInitializedPluginValues]);

  const removeCredentialPluginValue = useCallback((fieldName: string) => {
    setAccumulatedPluginValues((prev) => prev.filter((cp) => cp.input_field_name !== fieldName));
  }, []);

  const parsedCredentialTypes: EdaCredentialTypes | undefined = credentialTypes?.results?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as EdaCredentialTypes
  );

  const isExternalCredential =
    !!parsedCredentialTypes &&
    credential?.credential_type?.id &&
    parsedCredentialTypes?.[credential.credential_type.id]?.kind === 'external';

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaCredentialCreate, EdaCredential>();
  const postInputSourceRequest = usePostRequest();
  const deleteRequest = useDeleteRequest();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    const modifiedCredential = { ...credential };

    await patchRequest(edaAPI`/eda-credentials/${id.toString()}/`, modifiedCredential);

    if (credentialInputSources.length > 0 || accumulatedPluginValues.length > 0) {
      for (const existingSource of credentialInputSources) {
        if (existingSource?.id) {
          await deleteRequest(edaAPI`/credential-input-sources/${Number(existingSource?.id)}/`);
        }
      }

      for (const inputSource of accumulatedPluginValues) {
        const inputSourcePayload = {
          input_field_name: inputSource.input_field_name,
          source_credential: inputSource.source_credential,
          target_credential: Number(id),
          organization_id: credential.organization_id,
          metadata: inputSource.metadata,
        };
        await postInputSourceRequest(edaAPI`/credential-input-sources/`, inputSourcePayload);
      }
    }

    (cache as unknown as { clear: () => void }).clear?.();
    void navigate(-1);
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!credential) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
            { label: t('Edit Credential') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${credential?.name || t('Credential')}`}
          breadcrumbs={[
            { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
            { label: `${t('Edit')} ${credential?.name || t('Credential')}` },
          ]}
        />
        {!canPatchCredential ? (
          <>
            <Alert
              variant={'warning'}
              isInline
              style={{
                marginLeft: '24px',
                marginRight: '24px',
                marginTop: '24px',
                paddingLeft: '24px',
                paddingTop: '16px',
              }}
              title={t(
                'You do not have permissions to edit this credential. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <CredentialDetails />
          </>
        ) : (
          <EdaPageForm
            submitText={t('Save credential')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            autoComplete={'off'}
            defaultValue={{
              ...credential,
              organization_id: credential?.organization?.id,
              credential_type_id: credential?.credential_type?.id || undefined,
            }}
            additionalActions={
              isExternalCredential ? (
                <Button
                  aria-label={t('Test')}
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    openCredentialsExternalTestModal({
                      credential: credential,
                      credentialType:
                        parsedCredentialTypes !== undefined && credential?.credential_type?.id
                          ? parsedCredentialTypes[credential.credential_type.id]
                          : ({} as EdaCredentialType),
                      watchedSubFormFields: watchedSubFormFields,
                    });
                  }}
                  isDisabled={!isTestButtonEnabled || !isTestButtonEnabledSubForm}
                >
                  {t('Test')}
                </Button>
              ) : undefined
            }
          >
            <CredentialInputs
              editMode={true}
              credentialTypes={parsedCredentialTypes || {}}
              setIsTestButtonEnabled={setIsTestButtonEnabled}
              setIsTestButtonEnabledSubForm={setIsTestButtonEnabledSubForm}
              setWatchedSubFormFields={setWatchedSubFormFields}
              setCredentialPluginValues={setCredentialPluginValues}
              accumulatedPluginValues={accumulatedPluginValues}
              removeCredentialPluginValue={removeCredentialPluginValue}
            />
          </EdaPageForm>
        )}
      </PageLayout>
    );
  }
}
