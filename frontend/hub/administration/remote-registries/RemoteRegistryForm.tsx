import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '../../../../framework/PageForm/Inputs/PageFormSecret';
import { PageFormExpandableSection } from '../../../../framework/PageForm/PageFormExpandableSection';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useClearCache } from '../../../common/useInvalidateCache';
import { useIsValidUrl } from '../../../common/validation/useIsValidUrl';
import { HubError } from '../../common/HubError';
import { HubPageForm } from '../../common/HubPageForm';
import { hubAPI } from '../../common/api/formatPath';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { RemoteRegistry } from './RemoteRegistry';

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
const WriteOnlyFields: (
  | 'client_key'
  | 'password'
  | 'proxy_password'
  | 'proxy_username'
  | 'username'
)[] = ['client_key', 'password', 'proxy_password', 'proxy_username', 'username'];

export function CreateRemoteRegistry() {
  const { t } = useTranslation();
  const { clearCacheByKey } = useClearCache();
  clearCacheByKey(hubAPI`/_ui/v1/execution-environments/registries/`);
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<RemoteRegistryProps>();
  const onSubmit: PageFormSubmitHandler<RemoteRegistryProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);

    const createdRemoteRegistry = await postRequest(
      hubAPI`/_ui/v1/execution-environments/registries/`,
      {
        ...remote,
        url,
      }
    );
    pageNavigate(HubRoute.RemoteRegistryPage, {
      params: { id: createdRemoteRegistry?.name },
    });
  };

  const getPageUrl = useGetPageUrl();
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
        onCancel={() => navigate(-1)}
        defaultValue={{ name: '', url: '' }}
      >
        <>
          <RemoteInputs />
          <PageFormExpandableSection singleColumn>
            <ProxyAdvancedRemoteInputs />
            <CertificatesAdvancedRemoteInputs />
            <MiscAdvancedRemoteInputs />
          </PageFormExpandableSection>
        </>
      </HubPageForm>
    </PageLayout>
  );
}

const initialRemoteRegistry: Partial<RemoteRegistryProps> = {
  client_key: null,
  password: null,
  proxy_password: null,
  proxy_username: null,
  username: null,

  write_only_fields: WriteOnlyFields.map((key) => ({
    name: key,
    is_set: false,
  })),
};

export function EditRemoteRegistry() {
  const [clear, setClear] = useState(false);
  const { resetField } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const name = params.id;
  const { data, error, refresh } = useGet<HubItemsResponse<RemoteRegistryProps>>(
    hubAPI`/_ui/v1/execution-environments/registries/?name=${name}`
  );
  const getPageUrl = useGetPageUrl();
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const remoteRegistry = data?.data[0];

  const handleRefresh = () => {
    if (!error && !remoteRegistry) {
      navigate(-1);
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

  const onSubmit: PageFormSubmitHandler<RemoteRegistryProps> = async (remoteRegistry) => {
    const remoteRegistryId = parsePulpIDFromURL(remoteRegistry.pulp_href) as string;
    await hubAPIPut<RemoteRegistryProps>(
      hubAPI`/_ui/v1/execution-environments/registries/${remoteRegistryId}/`,
      remoteRegistry
    );
    navigate(-1);
  };

  const handleOnClear = (name: string) => {
    resetField(name);
    setClear(!clear);
    if (!remoteRegistry.write_only_fields) return;
    const index = remoteRegistry.write_only_fields.findIndex((field) => field.name === name);
    if (index !== undefined && index > -1) {
      remoteRegistry.write_only_fields[index].is_set = false;
    }
  };

  const shouldHideField = (name: string) => {
    if (!remoteRegistry.write_only_fields) return false;
    return !!remoteRegistry.write_only_fields.find((field) => field.name === name)?.is_set;
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
        onCancel={() => navigate(-1)}
        defaultValue={remoteRegistryDefaultValues}
      >
        <RemoteInputs disableEditName onClear={handleOnClear} shouldHideField={shouldHideField} />
        <PageFormExpandableSection singleColumn>
          <ProxyAdvancedRemoteInputs onClear={handleOnClear} shouldHideField={shouldHideField} />
          <CertificatesAdvancedRemoteInputs
            onClear={handleOnClear}
            shouldHideField={shouldHideField}
          />
          <MiscAdvancedRemoteInputs />
        </PageFormExpandableSection>
      </HubPageForm>
    </PageLayout>
  );
}

function ProxyAdvancedRemoteInputs({ onClear, shouldHideField }: SecretInput) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter a proxy URL')}
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
          placeholder={t('Enter a proxy username')}
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
          placeholder={t('Enter a proxy password')}
        />
      </PageFormSecret>
    </>
  );
}

function CertificatesAdvancedRemoteInputs({ onClear, shouldHideField }: SecretInput) {
  const { t } = useTranslation();
  return (
    <>
      <PageFormGroup
        label={t('TLS validation')}
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

function RemoteInputs({ onClear, shouldHideField, disableEditName }: IRemoteInputs) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a remote registry name')}
        isRequired
        isDisabled={disableEditName}
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter a URL')}
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
          placeholder={t('Enter a username')}
          labelHelp={t('The username to be used for authentication when syncing.')}
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
          placeholder={t('Enter a password')}
          labelHelp={t('The password to be used for authentication when syncing.')}
        />
      </PageFormSecret>
    </>
  );
}
