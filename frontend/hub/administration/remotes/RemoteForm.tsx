import { Alert } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  usePageNavigate,
} from '../../../../framework';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormSecret } from '../../../../framework/PageForm/Inputs/PageFormSecret';
import { PageFormExpandableSection } from '../../../../framework/PageForm/PageFormExpandableSection';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useClearCache } from '../../../common/useInvalidateCache';
import { useIsValidUrl } from '../../../common/validation/useIsValidUrl';
import { HubError } from '../../common/HubError';
import { HubPageForm } from '../../common/HubPageForm';
import { pulpAPI } from '../../common/api/formatPath';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { useHubContext } from '../../common/useHubContext';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubRemote } from './Remotes';
import { REMOTE_COMMUNITY_COLLECTIONS_URL, yamlRequirementsTemplate } from './constants';

interface SecretInput {
  onClear?: (name: string) => void;
  shouldHideField?: (name: string) => boolean;
}

interface IRemoteInputs extends SecretInput {
  isCommunityRemote?: boolean;
  setIsCommunityRemote?: (isCommunityRemote: boolean) => void;
  collection_signing?: boolean;
  disableEditName?: boolean;
}

interface IRequirementsFile {
  isCommunityRemote: boolean;
}

interface RemoteFormProps extends HubRemote {
  client_key?: string | null;
  password?: string | null;
  proxy_password?: string | null;
  proxy_username?: string | null;
  token?: string | null;
  username?: string | null;
}
type AllowedHiddenFields =
  | 'password'
  | 'token'
  | 'username'
  | 'client_key'
  | 'proxy_username'
  | 'proxy_password';

const HiddenFields: AllowedHiddenFields[] = [
  'client_key',
  'password',
  'proxy_password',
  'proxy_username',
  'token',
  'username',
];

export function CreateRemote() {
  const {
    featureFlags: { collection_signing },
  } = useHubContext();
  const { t } = useTranslation();
  const [isCommunityRemote, setIsCommunityRemote] = useState(false);
  const { clearCacheByKey } = useClearCache();
  clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<HubRemote>();
  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);
    if (remote?.requirements_file === yamlRequirementsTemplate) {
      delete remote.requirements_file;
    }
    if (remote?.proxy_username === '') {
      delete remote.proxy_username;
    }

    if (remote?.proxy_url === '') {
      delete remote.proxy_url;
    }

    const createdRemote = await postRequest(pulpAPI`/remotes/ansible/collection/`, {
      ...remote,
      url,
    });
    pageNavigate(HubRoute.RemotePage, { params: { id: createdRemote?.name } });
  };
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create remote')}
        breadcrumbs={[
          { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
          { label: t('Create remote') },
        ]}
      />
      <HubPageForm<HubRemote>
        submitText={t('Create remote')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{
          name: '',
          url: '',
          signed_only: false,
          sync_dependencies: false,
          requirements_file: yamlRequirementsTemplate,
        }}
      >
        <>
          <RemoteInputs
            isCommunityRemote={isCommunityRemote}
            setIsCommunityRemote={setIsCommunityRemote}
            collection_signing={collection_signing}
          />
          <PageFormExpandableSection singleColumn>
            <ProxyAdvancedRemoteInputs />
            <CertificatesAdvancedRemoteInputs />
            <MiscAdvancedRemoteInputs />
            <RequirementsFile isCommunityRemote={isCommunityRemote} />
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
  sync_dependencies: false,
  client_key: null,
  password: null,
  proxy_password: null,
  proxy_username: null,
  token: null,
  username: null,

  hidden_fields: HiddenFields.map((name) => ({ name, is_set: false })),
};

function isAllowedHiddenField(key: keyof RemoteFormProps): key is AllowedHiddenFields {
  return !HiddenFields.includes(key as AllowedHiddenFields);
}

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
    const propKey = key as RemoteFormPropsKey;
    if (isAllowedHiddenField(propKey)) {
      if (modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null) {
        delete modifiedRemote[propKey];
      }
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
    if (isAllowedHiddenField(field)) {
      if (modifiedRemote[field] === null && unmodifiedRemote[field] === null) {
        // API returns headers:null but doesn't accept it .. and we don't edit headers
        delete modifiedRemote[field];
      }
    }
  }

  return modifiedRemote;
}
export function EditRemote() {
  const {
    featureFlags: { collection_signing },
  } = useHubContext();
  const [clear, setClear] = useState(false);
  const [isCommunityRemote, setIsCommunityRemote] = useState(false);
  const { resetField } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;

  const { data, error, refresh } = useGet<PulpItemsResponse<RemoteFormProps>>(
    pulpAPI`/remotes/ansible/collection/?name=${name}`
  );

  const getPageUrl = useGetPageUrl();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
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
      pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(modifiedRemote.pulp_href)}/`,
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
        <HubError error={new Error(t('Remote not found'))} handleRefresh={handleRefresh} />
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

  const handleOnClear = (name: string) => {
    resetField(name);
    setClear(!clear);
    if (!remoteDefaultValues.hidden_fields) return;
    const index = remoteDefaultValues.hidden_fields?.findIndex((field) => field.name === name);
    if (index !== undefined && index > -1) {
      remoteDefaultValues.hidden_fields[index].is_set = false;
    }
  };

  const shouldHideField = (name: string) => {
    if (!remoteDefaultValues.hidden_fields) {
      return false;
    }
    return !!remoteDefaultValues.hidden_fields.find((field) => field.name === name)?.is_set;
  };

  return (
    <PageLayout>
      <PageHeader
        title={remote?.name ? t('Edit {{remoteName}}', { remoteName: remote?.name }) : t('Remote')}
        breadcrumbs={[
          { label: t('Remotes'), to: getPageUrl(HubRoute.Remotes) },
          {
            label: remote?.name
              ? t('Edit {{remoteName}}', { remoteName: remote?.name })
              : t('Remote'),
          },
        ]}
      />
      <HubPageForm<RemoteFormProps>
        submitText={t('Save remote')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={remoteDefaultValues}
      >
        <RemoteInputs
          disableEditName
          collection_signing={collection_signing}
          isCommunityRemote={isCommunityRemote}
          onClear={handleOnClear}
          setIsCommunityRemote={setIsCommunityRemote}
          shouldHideField={shouldHideField}
        />
        <PageFormExpandableSection singleColumn>
          <ProxyAdvancedRemoteInputs onClear={handleOnClear} shouldHideField={shouldHideField} />
          <CertificatesAdvancedRemoteInputs
            onClear={handleOnClear}
            shouldHideField={shouldHideField}
          />
          <MiscAdvancedRemoteInputs />
          <RequirementsFile isCommunityRemote={isCommunityRemote} />
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
      <PageFormTextInput<RemoteFormProps>
        name="proxy_url"
        label={t('Proxy URL')}
        placeholder={t('Enter a proxy URL')}
        labelHelp={t('The URL of an external proxy server.')}
        validate={isValidUrl}
      />
      <PageFormSecret
        onClear={() => {
          onClear && onClear('proxy_username');
        }}
        shouldHideField={shouldHideField && shouldHideField('proxy_username')}
      >
        <PageFormTextInput<RemoteFormProps>
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
        <PageFormTextInput<RemoteFormProps>
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
        <PageFormCheckbox<RemoteFormProps> name="tls_validation" />
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

function RemoteInputs({
  disableEditName,
  collection_signing,
  isCommunityRemote,
  onClear,
  setIsCommunityRemote,
  shouldHideField,
}: IRemoteInputs) {
  const { t } = useTranslation();
  const isValidUrl = useIsValidUrl();
  const urlInput = useWatch({ name: 'url' }) as string;
  const signedOnlyInput = useWatch({ name: 'signed_only' }) as boolean;

  const parsedInputUrl = useMemo(() => {
    if (urlInput === '') return '';
    try {
      return new URL(urlInput);
    } catch {
      return '';
    }
  }, [urlInput]);

  useEffect(() => {
    if (parsedInputUrl) {
      const parsedCommunityCollectionsUrl = new URL(REMOTE_COMMUNITY_COLLECTIONS_URL);
      const isCommunityRemote = parsedInputUrl.hostname === parsedCommunityCollectionsUrl.hostname;
      setIsCommunityRemote && setIsCommunityRemote(isCommunityRemote);
    }
  }, [parsedInputUrl, setIsCommunityRemote]);

  return (
    <>
      <PageFormTextInput<RemoteFormProps>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a remote name')}
        isRequired
        isDisabled={disableEditName}
      />
      <PageFormTextInput<RemoteFormProps>
        name="url"
        label={t('URL')}
        placeholder={t('Enter a URL')}
        labelHelp={t('The URL of an external content source.')}
        isRequired
        validate={isValidUrl}
      />
      {collection_signing ? (
        <PageFormGroup
          label={t('Signed collections only')}
          labelHelp={t('Download only signed collections')}
        >
          <>
            <PageFormCheckbox<RemoteFormProps> name="signed_only" />
            {isCommunityRemote && signedOnlyInput ? (
              <Alert
                data-cy="signed-only-warning"
                isInline
                variant="warning"
                title={t`Community content will never be synced if this setting is enabled`}
              />
            ) : null}
          </>
        </PageFormGroup>
      ) : null}
      <PageFormGroup
        label={t('Sync all dependencies')}
        labelHelp={t('Include all dependencies when syncing a collection')}
      >
        <PageFormCheckbox<RemoteFormProps> name="sync_dependencies" />
      </PageFormGroup>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('username');
        }}
        shouldHideField={shouldHideField && shouldHideField('username')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="username"
          label={t('Username')}
          placeholder={t('Enter a username')}
          labelHelp={t(
            'The username to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>
      <PageFormSecret
        onClear={() => {
          onClear && onClear('password');
        }}
        shouldHideField={shouldHideField && shouldHideField('password')}
      >
        <PageFormTextInput<RemoteFormProps>
          type="password"
          name="password"
          label={t('Password')}
          placeholder={t('Enter a password')}
          labelHelp={t(
            'The password to be used for authentication when syncing. This is not required when using a token.'
          )}
        />
      </PageFormSecret>

      <PageFormSecret
        onClear={() => {
          onClear && onClear('token');
        }}
        shouldHideField={shouldHideField && shouldHideField('token')}
      >
        <PageFormTextInput<RemoteFormProps>
          name="token"
          type="password"
          label={t('Token')}
          placeholder={t('Enter a token')}
          labelHelp={t('Token for authenticating to the server URL.')}
        />
      </PageFormSecret>
      <PageFormTextInput<RemoteFormProps>
        name="auth_url"
        label={t('SSO URL')}
        placeholder={t('Enter a SSO URL')}
        labelHelp={t('Single sign on URL.')}
        validate={isValidUrl}
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

function RequirementsFile({ isCommunityRemote }: IRequirementsFile) {
  const { t } = useTranslation();
  const isRequired = isCommunityRemote;

  return (
    <PageFormSection singleColumn>
      <PageFormDataEditor<RemoteFormProps>
        name="requirements_file"
        label={t('Requirements file')}
        format="yaml"
        labelHelp={TranslationLabelHelp()}
        labelHelpTitle={t('Requirements file')}
        isRequired={isRequired}
      />
    </PageFormSection>
  );
}
