import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormExpandableSection } from '../../../framework/PageForm/PageFormExpandableSection';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubPageForm } from '../HubPageForm';
import { HubRoute } from '../HubRoutes';
import { appendTrailingSlash, hubAPI } from '../api/utils';
import { RemoteRegistry } from './RemoteRegistry';

interface RemoteRegistryProps extends RemoteRegistry {
  client_key?: string;
  password?: string;
  proxy_password?: string;
  proxy_username?: string;
  token?: string;
  username?: string;
  [key: string]: unknown;
}

export function CreateRemoteRegistry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<RemoteRegistryProps>();
  const onSubmit: PageFormSubmitHandler<RemoteRegistryProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);

    await postRequest(hubAPI`/_ui/v1/execution-environments/registries/`, {
      ...remote,
      url,
    });
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create remote registry ')}
        breadcrumbs={[
          { label: t('Remote registries'), to: getPageUrl(HubRoute.RemoteRegistries) },
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

function ProxyAdvancedRemoteInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter a proxy URL')}
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="proxy_username"
        label={t('Proxy username')}
        placeholder={t('Enter a proxy username')}
      />
      <PageFormTextInput<RemoteRegistryProps>
        type="password"
        name="proxy_password"
        label={t('Proxy password')}
        placeholder={t('Enter a proxy password')}
      />
    </>
  );
}

function CertificatesAdvancedRemoteInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormGroup
        label={t('TLS validation')}
        labelHelp={t('If selected, TLS peer validation must be performed.')}
      >
        <PageFormCheckbox<RemoteRegistryProps> name="tls_validation" />
      </PageFormGroup>
      <PageFormFileUpload
        type="text"
        hideDefaultPreview
        label={t('Client key')}
        name="client_key"
        labelHelp={t('A PEM encoded private key used for authentication.')}
      />
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

function RemoteInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<RemoteRegistryProps>
        name="name"
        label={t('Remote name')}
        placeholder={t('Enter a remote name')}
        isRequired
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter a URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="username"
        label={t('Username')}
        placeholder={t('Enter a username')}
        labelHelp={t(
          'The username to be used for authentication when syncing. This is not required when using a token.'
        )}
      />
      <PageFormTextInput<RemoteRegistryProps>
        type="password"
        name="password"
        label={t('Password')}
        placeholder={t('Enter a password')}
        labelHelp={t(
          'The password to be used for authentication when syncing. This is not required when using a token.'
        )}
      />
      <PageFormTextInput<RemoteRegistryProps>
        name="token"
        type="password"
        label={t('Token')}
        placeholder={t('Enter a token')}
        labelHelp={t('Token for authenticating to the server URL.')}
      />
    </>
  );
}
