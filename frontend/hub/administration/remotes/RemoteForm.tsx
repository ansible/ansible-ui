import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormExpandableSection } from '../../../../framework/PageForm/PageFormExpandableSection';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useClearCache } from '../../../common/useInvalidateCache/useInvalidateCache';
import { HubError } from '../../common/HubError';
import { HubPageForm } from '../../common/HubPageForm';
import { pulpAPI } from '../../common/api/formatPath';
import { appendTrailingSlash, hubAPIPut, parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { useHubContext } from '../../common/useHubContext';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubRemote } from './Remotes';
import {
  CommunityRemoteyamlRequirementsTemplate,
  REMOTE_COMMUNITY_COLLECTIONS_URL,
  yamlRequirementsTemplate,
} from './constants';
import { RequirementsFile } from './components/RequirementsFile';
import { RemoteInputs } from './components/RemoteInputs';
import { useGetParsedInputUrl } from './hooks/useGetParsedInputUrl';
import { MiscAdvancedRemoteInputs } from './components/MiscAdvancedRemoteInputs';
import { CertificatesAdvancedRemoteInputs } from './components/CertificatesAdvancedRemoteInputs';
import { ProxyAdvancedRemoteInputs } from './components/ProxyAdvancedRemoteInputs';

export interface SecretInput {
  onClear?: (name: string) => void;
  shouldHideField?: (name: string) => boolean;
}

export interface RemoteFormProps extends HubRemote {
  client_key?: string | null;
  password?: string | null;
  proxy_password?: string | null;
  proxy_username?: string | null;
  token?: string | null;
  username?: string | null;
}
export type AllowedHiddenFields =
  | 'password'
  | 'token'
  | 'username'
  | 'client_key'
  | 'proxy_username'
  | 'proxy_password';

export const HiddenFields: AllowedHiddenFields[] = [
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
          <RemoteInputs isCommunityRemote={false} collection_signing={collection_signing} />
          <PageFormSection singleColumn>
            <RequirementsFile isCommunityRemote={false} />
          </PageFormSection>
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
  const [isCommunityRemote, setIsCommunityRemote] = useState<undefined | boolean>();
  const { resetField } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { clearCacheByKey } = useClearCache();

  const { data, error, refresh, isLoading } = useGet<PulpItemsResponse<HubRemote>>(
    pulpAPI`/remotes/ansible/collection/?name=${name}`
  );
  const remote = data?.results[0];

  const getPageUrl = useGetPageUrl();
  const parsedInputUrl = useGetParsedInputUrl();

  useEffect(() => {
    const url = parsedInputUrl(remote);
    if (url) {
      const parsedCommunityCollectionsUrl = new URL(REMOTE_COMMUNITY_COLLECTIONS_URL);
      const isCommunityRemote = url.hostname === parsedCommunityCollectionsUrl.hostname;
      setIsCommunityRemote(isCommunityRemote);
    }
  }, [parsedInputUrl, remote, setIsCommunityRemote]);
  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!data || isLoading || isCommunityRemote === undefined)
    return <LoadingPage breadcrumbs tabs />;

  const handleRefresh = () => {
    // Navigate back when remote is not found
    if (!error && !remote) {
      navigate(-1);
    }
  };

  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (modifiedRemote) => {
    const updatedRemote = smartUpdate(modifiedRemote, remote!);
    if (updatedRemote?.requirements_file === yamlRequirementsTemplate) {
      delete updatedRemote.requirements_file;
    }
    await hubAPIPut<RemoteFormProps>(
      pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(modifiedRemote.pulp_href)}/`,
      updatedRemote
    );

    clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
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
    if (remote?.requirements_file === '' || remote?.requirements_file === null) {
      return {
        ...remoteValues,
        requirements_file: isCommunityRemote
          ? CommunityRemoteyamlRequirementsTemplate
          : yamlRequirementsTemplate,
      };
    }
    return remoteValues;
  }
  const remoteDefaultValues = {
    ...initialRemote,
    ...updateRemoteRequirements(remote!),
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
          shouldHideField={shouldHideField}
        />{' '}
        <PageFormSection singleColumn>
          <RequirementsFile isCommunityRemote={isCommunityRemote} />
        </PageFormSection>
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
