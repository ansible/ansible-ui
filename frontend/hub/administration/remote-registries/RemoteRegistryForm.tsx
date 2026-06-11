import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSecret';
import { PageFormExpandableSection } from '@ansible/ansible-ui-framework/PageForm/PageFormExpandableSection';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { useIsValidUrl } from '@ansible/common-ui/validation/useIsValidUrl';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { HubError } from '../../common/HubError';
import { HubPageForm } from '../../common/HubPageForm';
import { hubAPI } from '../../common/api/formatPath';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { type HiddenFieldsType } from '../remotes/RemoteForm';
import { type RemoteRegistry } from './RemoteRegistry';

interface SecretInput {
  onClear?: (name: string) => void;
  shouldHideField?: (name: string) => boolean;
}

interface IRemoteInputs extends SecretInput {
  disableEditName?: boolean;
}

interface RemoteRegistryProps extends RemoteRegistry {
  client_key?: string | null;
  password?: string | null;
  proxy_password?: string | null;
  proxy_username?: string | null;
  username?: string | null;
}

export function CreateRemoteRegistry() {
  const { t } = useTranslation();
  const { clearCacheByKey } = useClearCache();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<RemoteRegistryProps>();

  const onSubmit: PageFormSubmitHandler<RemoteRegistryProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);

    // fixes fields that are only required when present
    ['username', 'password', 'proxy_username', 'proxy_password', 'proxy_url'].forEach((field) => {
      // @ts-expect-error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'RemoteRegistryProps'.
      if (remote[field] === '') {
        // @ts-expect-error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'RemoteRegistryProps'.
        delete remote[field];
      }
    });

    const createdRemoteRegistry = await postRequest(
      hubAPI`/_ui/v1/execution-environments/registries/`,
      {
        ...remote,
        url,
      }
    );

    clearCacheByKey(hubAPI`/_ui/v1/execution-environments/registries/`);
    pageNavigate(HubRoute.RemoteRegistryDetails, {
      params: { id: createdRemoteRegistry?.name },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create remote registry ')}
        breadcrumbs={[
          { label: t('Remote Registries'), to: getPageUrl(HubRoute.RemoteRegistries) },
          { label: t('Create remote registry') },
        ]}
      />
      <HubPageForm<RemoteRegistryProps>
        submitText={t('Create remote registry')}
        onSubmit={onSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={{ name: '', url: '' }}
      >
        <FormWrapper isNew />
      </HubPageForm>
    </PageLayout>
  );
}

// defaults for hidden fields
const initialRemoteRegistry: Partial<RemoteRegistryProps> = {
  client_key: null,
  password: null,
  proxy_password: null,
  proxy_username: null,
  username: null,
};

type RemoteKey = keyof RemoteRegistryProps;

function smartUpdate(modifiedRemote: RemoteRegistryProps, unmodifiedRemote: RemoteRegistryProps) {
  const getWriteOnlyField = (key: RemoteKey, from: RemoteRegistryProps) =>
    from?.write_only_fields?.find((field) => field.name === key);
  const isWriteOnlyField = (key: RemoteKey) => !!getWriteOnlyField(key, unmodifiedRemote);

  /**
   * When a field is clear ('' or null):
   * - If it has been explicitly cleared in the edit, record the null or '' value in the response
   * - If it was unchanged, delete it from the response
   */
  (Object.keys(modifiedRemote) as RemoteKey[]).forEach((propKey) => {
    const isEmpty = modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null;
    const wasEmpty = unmodifiedRemote[propKey] === '' || unmodifiedRemote[propKey] === null;
    const unchanged = isWriteOnlyField(propKey)
      ? getWriteOnlyField(propKey, unmodifiedRemote)?.is_set ===
        getWriteOnlyField(propKey, modifiedRemote)?.is_set
      : wasEmpty;

    if (!isEmpty) return;

    // @ts-expect-error TS2322: Type 'null' is not assignable to type 'never'.
    modifiedRemote[propKey] = null;

    if (unchanged) delete modifiedRemote[propKey];
  });

  return modifiedRemote;
}

export function EditRemoteRegistry() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const { clearCacheByKey } = useClearCache();

  const name = params.id;
  const { data, error, refresh } = useGet<HubItemsResponse<RemoteRegistryProps>>(
    name ? hubAPI`/_ui/v1/execution-environments/registries/?name=${name}` : undefined
  );

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const remoteRegistry = data?.data[0];

  const handleRefresh = () => {
    if (!error && !remoteRegistry) {
      void navigate(-1);
    }
  };

  if (data && data.data.length === 0 && !error && !remoteRegistry) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Remote registries'), to: getPageUrl(HubRoute.RemoteRegistries) },
            { label: t('Edit remote registry') },
          ]}
        />
        <HubError error={new Error(t('Remote registry not found'))} handleRefresh={handleRefresh} />
      </PageLayout>
    );
  }

  const onSubmit: PageFormSubmitHandler<RemoteRegistryProps> = async (modifiedRemoteRegistry) => {
    const updatedRemote = smartUpdate(modifiedRemoteRegistry, remoteRegistry);

    await hubAPIPut<RemoteRegistryProps>(
      hubAPI`/_ui/v1/execution-environments/registries/${parsePulpIDFromURL(remoteRegistry.pulp_href)}/`,
      updatedRemote
    );

    clearCacheByKey(hubAPI`/_ui/v1/execution-environments/registries/`);
    pageNavigate(HubRoute.RemoteRegistryDetails, {
      params: { id: name },
    });
  };

  const remoteRegistryDefaultValues = {
    ...initialRemoteRegistry,
    ...remoteRegistry,
  };

  return (
    <PageLayout>
      <PageHeader
        title={
          remoteRegistry?.name
            ? t('Edit {{remoteregistryName}}', { remoteregistryName: remoteRegistry?.name })
            : t('Remote Registry')
        }
        breadcrumbs={[
          { label: t('Remote Registries'), to: getPageUrl(HubRoute.RemoteRegistries) },
          {
            label: remoteRegistry?.name
              ? t('Edit {{remoteregistryName}}', { remoteregistryName: remoteRegistry?.name })
              : t('Remote Registry'),
          },
        ]}
      />
      <HubPageForm<RemoteRegistryProps>
        submitText={t('Save remote registry')}
        onSubmit={onSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={remoteRegistryDefaultValues}
      >
        <FormWrapper />
      </HubPageForm>
    </PageLayout>
  );
}

function ProxyAdvancedRemoteInputs({ onClear, shouldHideField }: Readonly<SecretInput>) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();

  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter proxy URL')}
        validate={isValidUrl}
      />
      <PageFormSecret
        onClear={() => {
          onClear && onClear('proxy_username');
        }}
        shouldHideField={shouldHideField && shouldHideField('proxy_username')}
      >
        <PageFormTextInput<RemoteRegistryProps>
          name="proxy_username"
          label={t('Proxy username')}
          placeholder={t('Enter proxy username')}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('proxy_password');
        }}
        shouldHideField={shouldHideField && shouldHideField('proxy_password')}
      >
        <PageFormTextInput<RemoteRegistryProps>
          type="password"
          name="proxy_password"
          label={t('Proxy password')}
          placeholder={t('Enter proxy password')}
        />
      </PageFormSecret>
    </>
  );
}

function CertificatesAdvancedRemoteInputs({ onClear, shouldHideField }: Readonly<SecretInput>) {
  const { t } = useTranslation();

  return (
    <>
      <PageFormGroup
        label={t('TLS validation')}
        labelHelpTitle={t('TLS validation')}
        labelHelp={t('If selected, TLS peer validation must be performed.')}
      >
        <PageFormCheckbox<RemoteRegistryProps> name="tls_validation" />
      </PageFormGroup>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('client_key');
        }}
        shouldHideField={shouldHideField && shouldHideField('client_key')}
      >
        <PageFormFileUpload
          type="text"
          hideDefaultPreview
          label={t('Client key')}
          name="client_key"
          labelHelp={t('A PEM encoded private key used for authentication.')}
        />
      </PageFormSecret>
      <PageFormFileUpload
        type="text"
        hideDefaultPreview
        label={t('Client certificate')}
        name="client_cert"
        labelHelp={t('A PEM encoded client certificate used for authentication.')}
      />
      <PageFormFileUpload
        type="text"
        hideDefaultPreview
        label={t('CA certificate')}
        name="ca_cert"
        labelHelp={t('A PEM encoded client certificate used for authentication.')}
      />
    </>
  );
}

function MiscAdvancedRemoteInputs() {
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="download_concurrency"
        label={t('Download concurrency')}
        type="number"
        placeholder={t('Download concurrency')}
        labelHelp={t('Total number of simultaneous connections.')}
        min={1}
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="rate_limit"
        label={t('Rate limit')}
        type="number"
        placeholder={t('Rate limit')}
        labelHelp={t('Limits total download rate in requests per second.')}
      />
    </>
  );
}

function RemoteInputs({ onClear, shouldHideField, disableEditName }: Readonly<IRemoteInputs>) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();

  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter remote registry name')}
        isRequired
        isDisabled={disableEditName}
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
        validate={isValidUrl}
      />
      <PageFormSecret
        onClear={() => {
          onClear && onClear('username');
        }}
        shouldHideField={shouldHideField && shouldHideField('username')}
      >
        <PageFormTextInput<RemoteRegistryProps>
          name="username"
          label={t('Username')}
          placeholder={t('Enter username')}
          labelHelp={t('The username for authentication when syncing.')}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('password');
        }}
        shouldHideField={shouldHideField && shouldHideField('password')}
      >
        <PageFormTextInput<RemoteRegistryProps>
          type="password"
          name="password"
          label={t('Password')}
          placeholder={t('Enter password')}
          labelHelp={t('The password for authentication when syncing.')}
        />
      </PageFormSecret>
    </>
  );
}

function FormWrapper({ isNew }: Readonly<{ isNew?: boolean }>) {
  const { getValues, resetField, setValue } = useFormContext();
  const [reload, setReload] = useState(0);

  const shouldHideField = (name: string) => {
    const hiddenFields = getValues('write_only_fields') as HiddenFieldsType;
    if (!hiddenFields) return false;

    return !!hiddenFields.find((field) => field.name === name)?.is_set;
  };

  const handleOnClear = (name: string) => {
    resetField(name, { defaultValue: null });

    // resetField nor setValue cause a re-render, force it
    setReload(reload + 1);

    const hiddenFields = getValues('write_only_fields') as HiddenFieldsType;
    if (!hiddenFields) return;

    const field = hiddenFields.find((field) => field.name === name);
    if (field) {
      field.is_set = false;
      setValue('write_only_fields', hiddenFields);
    }
  };

  return (
    <>
      <RemoteInputs
        disableEditName={!isNew}
        onClear={handleOnClear}
        shouldHideField={shouldHideField}
      />
      <PageFormExpandableSection singleColumn>
        <ProxyAdvancedRemoteInputs onClear={handleOnClear} shouldHideField={shouldHideField} />
        <CertificatesAdvancedRemoteInputs
          onClear={handleOnClear}
          shouldHideField={shouldHideField}
        />
        <MiscAdvancedRemoteInputs />
      </PageFormExpandableSection>
    </>
  );
}
