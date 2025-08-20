import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { requestGet, swrOptions } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Button } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredential, EdaCredentialCreate } from '../../interfaces/EdaCredential';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { EdaOrganization } from '../../interfaces/EdaOrganization';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaRoute } from '../../main/EdaRoutes';
import { CredentialInputs, EdaCredentialTypes } from './CredentialInputs';
import { CredentialPluginsInputSource } from './hooks/useCredentialSecretModal';
import { useCredentialsTestModal } from './hooks/useCredentialsTestModal';

export function CreateCredential() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const openCredentialsExternalTestModal = useCredentialsTestModal();
  const [selectedCredentialTypeId, setSelectedCredentialTypeId] = useState<number>(0);
  const [isTestButtonEnabled, setIsTestButtonEnabled] = useState(false);
  const [isTestButtonEnabledSubForm, setIsTestButtonEnabledSubForm] = useState(false);
  const [watchedSubFormFields, setWatchedSubFormFields] = useState<unknown[]>([]);
  const [credentialPluginValues, setCredentialPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const [accumulatedPluginValues, setAccumulatedPluginValues] = useState<
    CredentialPluginsInputSource[]
  >([]);
  const { data: credentialTypes } = useGet<EdaResult<EdaCredentialType>>(
    edaAPI`/credential-types/?page=1&page_size=200`
  );

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

  const removeCredentialPluginValue = useCallback((fieldName: string) => {
    setAccumulatedPluginValues((prev) => prev.filter((cp) => cp.input_field_name !== fieldName));
  }, []);

  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization = organizations?.results?.[0];

  const parsedCredentialTypes: EdaCredentialTypes | undefined = credentialTypes?.results?.reduce(
    (credentialTypesMap, credentialType) => {
      credentialTypesMap[credentialType.id] = credentialType;
      return credentialTypesMap;
    },
    {} as EdaCredentialTypes
  );

  const isExternalCredential =
    !!parsedCredentialTypes &&
    parsedCredentialTypes?.[selectedCredentialTypeId]?.kind === 'external';

  const postRequest = usePostRequest<EdaCredentialCreate, EdaCredential>();
  const postInputSourceRequest = usePostRequest();

  const onSubmit: PageFormSubmitHandler<EdaCredentialCreate> = async (credential) => {
    const modifiedCredential = { ...credential };

    const newCredential = await postRequest(edaAPI`/eda-credentials/`, modifiedCredential);

    if (accumulatedPluginValues.length > 0) {
      for (const inputSource of accumulatedPluginValues) {
        const inputSourcePayload = {
          input_field_name: inputSource.input_field_name,
          source_credential: inputSource.source_credential,
          target_credential: newCredential.id,
          organization_id: credential.organization_id,
          metadata: inputSource.metadata,
        };
        await postInputSourceRequest(edaAPI`/credential-input-sources/`, inputSourcePayload);
      }
    }

    pageNavigate(EdaRoute.CredentialPage, { params: { id: newCredential.id } });
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create credential')}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
          { label: t('Create credential') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create credential')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ organization_id: defaultOrganization?.id }}
        additionalActions={
          isExternalCredential ? (
            <Button
              aria-label={t('Test')}
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                openCredentialsExternalTestModal({
                  credentialType:
                    parsedCredentialTypes !== undefined
                      ? parsedCredentialTypes[selectedCredentialTypeId]
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
          editMode={false}
          credentialTypes={parsedCredentialTypes || {}}
          setSelectedCredentialTypeId={setSelectedCredentialTypeId}
          setIsTestButtonEnabled={setIsTestButtonEnabled}
          setIsTestButtonEnabledSubForm={setIsTestButtonEnabledSubForm}
          setWatchedSubFormFields={setWatchedSubFormFields}
          setCredentialPluginValues={setCredentialPluginValues}
          accumulatedPluginValues={accumulatedPluginValues}
          removeCredentialPluginValue={removeCredentialPluginValue}
        />
      </EdaPageForm>
    </PageLayout>
  );
}
