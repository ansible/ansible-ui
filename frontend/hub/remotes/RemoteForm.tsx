import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormExpandableSection } from '../../../framework/PageForm/PageFormExpandableSection';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { AwxError } from '../../awx/common/AwxError';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubPageForm } from '../HubPageForm';
import { HubRoute } from '../HubRoutes';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL, pulpAPI } from '../api/utils';
import { PulpItemsResponse } from '../usePulpView';
import { IRemotes } from './Remotes';

interface RemoteFormProps extends IRemotes {
  client_key?: string;
  password?: string;
  proxy_password?: string;
  proxy_username?: string;
  token?: string;
  username?: string;
}
const yamlRequirementsTemplate = [
  '# Sample requirements.yaml',
  '',
  'collections:',
  '  - name: my_namespace.my_collection_name',
  '  - name: my_namespace.my_collection_name2',
].join('\n');

export function CreateRemote() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<IRemotes>();
  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);
    if (remote?.requirements_file === yamlRequirementsTemplate) {
      delete remote.requirements_file;
    }
    if (remote?.proxy_username === '') {
      delete remote.proxy_username;
    }

    await postRequest(pulpAPI`/remotes/ansible/collection/`, {
      ...remote,
      url,
    });
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Remote')}
        breadcrumbs={[
          { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
          { label: t('Create Remote') },
        ]}
      />
      <HubPageForm<IRemotes>
        submitText={t('Create remote')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{ name: '', url: '', requirements_file: yamlRequirementsTemplate }}
      >
        <>
          <RemoteInputs />
          <PageFormExpandableSection singleColumn>
            <ProxyAdvancedRemoteInputs />
            <CertificatesAdvancedRemoteInputs />
            <MiscAdvancedRemoteInputs />
            <RequirementsFile />
          </PageFormExpandableSection>
        </>
      </HubPageForm>
    </PageLayout>
  );
}

const initialRemote: Partial<RemoteFormProps> = {
  name: '',
  url: '',
  ca_cert: null,
  client_cert: null,
  tls_validation: true,
  proxy_url: null,
  download_concurrency: null,
  rate_limit: null,
  requirements_file: '---',
  auth_url: null,
  signed_only: false,

  hidden_fields: [
    'client_key',
    'proxy_username',
    'proxy_password',
    'username',
    'password',
    'token',
  ].map((name) => ({ name, is_set: false })),
};

type RemoteFormPropsKey = keyof RemoteFormProps;
function smartUpdate(modifiedRemote: RemoteFormProps, unmodifiedRemote: RemoteFormProps) {
  // Adapted from https://github.com/ansible/ansible-hub-ui/blob/625157662113cd68c3b121508fa8f64613339a71/src/api/ansible-remote.ts#L5
  if (modifiedRemote.hidden_fields) {
    delete modifiedRemote.hidden_fields;
  }

  if (modifiedRemote.my_permissions) {
    delete modifiedRemote.my_permissions;
  }

  Object.keys(modifiedRemote).forEach((key) => {
    const propKey = key as keyof RemoteFormProps;
    if (modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null) {
      delete modifiedRemote[propKey];
    }
  });

  // Pulp complains if auth_url gets sent with a request that doesn't include a
  // valid token, even if the token exists in the database and isn't being changed.
  // To solve this issue, simply delete auth_url from the request if it hasn't
  // been updated by the user.
  if (modifiedRemote.auth_url === unmodifiedRemote.auth_url) {
    delete modifiedRemote.auth_url;
  }
  const keys = Object.keys(modifiedRemote) as RemoteFormPropsKey[];
  for (const field of keys) {
    // API returns headers:null but doesn't accept it .. and we don't edit headers
    if (modifiedRemote[field] === null && unmodifiedRemote[field] === null) {
      delete modifiedRemote[field];
    }
  }

  return modifiedRemote;
}
export function EditRemote() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { data, error, refresh } = useGet<PulpItemsResponse<RemoteFormProps>>(
    pulpAPI`/remotes/ansible/collection/?name=${name ?? ''}`
  );

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const remote = data.results[0];

  const handleRefresh = () => {
    // Navigate back when remote is not found
    if (!error && !remote) {
      navigate(-1);
    }
  };

  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (modifiedRemote) => {
    const updatedRemote = smartUpdate(modifiedRemote, remote);
    if (updatedRemote?.requirements_file === yamlRequirementsTemplate) {
      delete updatedRemote.requirements_file;
    }
    await hubAPIPut<RemoteFormProps>(
      pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(modifiedRemote.pulp_href) ?? ''}`,
      updatedRemote
    );
    navigate(-1);
  };

  if (data && data.count === 0 && !error && !remote) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
            { label: t('Edit Remote') },
          ]}
        />
        <AwxError error={new Error(t('Remote not found'))} handleRefresh={handleRefresh} />
      </PageLayout>
    );
  }

  function updateRemoteRequirements(remoteValues: RemoteFormProps) {
    if (remote.requirements_file === '' || remote.requirements_file === null) {
      return {
        ...remoteValues,
        requirements_file: yamlRequirementsTemplate,
      };
    }
    return remoteValues;
  }

  const remoteDefaultValues = {
    ...initialRemote,
    ...updateRemoteRequirements(remote),
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Remote')}
        breadcrumbs={[
          { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
          { label: t(' Remote') },
        ]}
      />
      <HubPageForm<RemoteFormProps>
        submitText={t('Edit remote')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={remoteDefaultValues}
      >
        <RemoteInputs />
        <PageFormExpandableSection singleColumn>
          <ProxyAdvancedRemoteInputs />
          <CertificatesAdvancedRemoteInputs />
          <MiscAdvancedRemoteInputs />
          <RequirementsFile />
        </PageFormExpandableSection>
      </HubPageForm>
    </PageLayout>
  );
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
        name="auth_url"
        label={t('SSO URL')}
        placeholder={t('Enter a SSO URL')}
        labelHelp={t('Single sign on URL.')}
      />
    </>
  );
}

const TranslationLabelHelp = () => {
  return (
    <Trans i18nKey="requirementsFileHelp">
      This uses the same{' '}
      <Link to="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html#installing-collections-with-ansible-galaxy">
        requirements.yml{' '}
      </Link>
      format as the ansible - galaxy CLI with the caveat that roles are not supported and the source
      parameter is not supported.
    </Trans>
  );
};

function RequirementsFile() {
  const { t } = useTranslation();
  return (
    <PageFormSection singleColumn>
      <PageFormDataEditor<RemoteFormProps>
        name="requirements_file"
        label={t('Requirements file')}
        defaultExpanded={true}
        labelHelp={TranslationLabelHelp()}
        toggleLanguages={['yaml']}
        labelHelpTitle={t('Requirements file')}
      />
    </PageFormSection>
  );
}
