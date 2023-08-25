import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { IRemotes } from './Remotes';
import {
  PageForm,
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { appendTrailingSlash, pulpAPI } from '../api/utils';
import { RouteObj } from '../../Routes';
import { PageFormExpandableSection } from '../../../framework/PageForm/PageFormExpandableSection';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';

export function CreateRemote() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<IRemotes>();
  const onSubmit: PageFormSubmitHandler<IRemotes> = async (remote) => {
    const url = appendTrailingSlash(remote.url);
    await postRequest(pulpAPI`/remotes/ansible/collection/`, {
      ...remote,
      url,
    });
    navigate(-1);
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Remote')}
        breadcrumbs={[{ label: t('Remotes'), to: RouteObj.Remotes }, { label: t('Create Remote') }]}
      />
      <PageForm<IRemotes>
        submitText={t('Create remote')}
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
      </PageForm>
    </PageLayout>
  );
}

interface RemoteFormProps extends IRemotes {
  token?: string;
  username?: string;
  password?: string;
  sso_url?: string;
  proxy_username?: string;
  proxy_password?: string;
}

function ProxyAdvancedRemoteInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter a proxy URL')}
      />
      <PageFormTextInput<RemoteFormProps>
        name="proxy_username"
        label={t('Proxy username')}
        placeholder={t('Enter a proxy username')}
      />
      <PageFormTextInput<RemoteFormProps>
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
        <PageFormCheckbox<RemoteFormProps> name="tls_validation" />
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
      <PageFormTextInput<RemoteFormProps>
        name="download_concurrency"
        label={t('Download concurrency')}
        type="number"
        placeholder={t('Download concurrency')}
        labelHelp={t('Total number of simultaneous connections.')}
      />
      <PageFormTextInput<RemoteFormProps>
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
      <PageFormTextInput<RemoteFormProps>
        name="name"
        label={t('Remote name')}
        placeholder={t('Enter a remote name')}
        isRequired
      />
      <PageFormTextInput<RemoteFormProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter a URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
      />
      <PageFormTextInput<RemoteFormProps>
        name="username"
        label={t('Username')}
        placeholder={t('Enter a username')}
        labelHelp={t(
          'The username to be used for authentication when syncing. This is not required when using a token.'
        )}
      />
      <PageFormTextInput<RemoteFormProps>
        type="password"
        name="password"
        label={t('Password')}
        placeholder={t('Enter a password')}
        labelHelp={t(
          'The password to be used for authentication when syncing. This is not required when using a token.'
        )}
      />
      <PageFormTextInput<RemoteFormProps>
        name="token"
        type="password"
        label={t('Token')}
        placeholder={t('Enter a token')}
        labelHelp={t('Token for authenticating to the server URL.')}
      />
      <PageFormTextInput<RemoteFormProps>
        name="sso_url"
        label={t('SSO URL')}
        placeholder={t('Enter a SSO URL')}
        labelHelp={t('Single sign on URL.')}
      />
    </>
  );
}
