import { useState } from 'react';
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
import { CertificatesAdvancedRemoteInputs } from './components/CertificatesAdvancedRemoteInputs';
import { MiscAdvancedRemoteInputs } from './components/MiscAdvancedRemoteInputs';
import { ProxyAdvancedRemoteInputs } from './components/ProxyAdvancedRemoteInputs';
import { RemoteInputs } from './components/RemoteInputs';
import { RequirementsFile } from './components/RequirementsFile';
import { yamlRequirementsTemplate } from './constants';

export type HiddenFieldsType = { name: AllowedHiddenFields; is_set: boolean }[];

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

const compareYaml = (firstYaml: string, secondYaml: string) => {
  const processYaml = (content: string): string[] => {
    return (
      content
        .split('\n')
        .map((line) => line.trim())
        // Remove empty lines and comments
        .filter((line) => !line.startsWith('#') && line !== '' && line !== '---')
    );
  };

  const firstProcessedYaml = processYaml(firstYaml);
  const secondProcessedYaml = processYaml(secondYaml);

  if (firstProcessedYaml.length !== firstProcessedYaml.length) {
    return false;
  }

  for (let i = 0; i < firstProcessedYaml.length; i++) {
    if (firstProcessedYaml[i] !== secondProcessedYaml[i]) {
      return false;
    }
  }

  return true;
};

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
  const [isCommunityRemote, setIsCommunityRemote] = useState(false);

  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (remote) => {
    const url: string = appendTrailingSlash(remote.url);
    if (compareYaml(remote?.requirements_file ?? '', yamlRequirementsTemplate)) {
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
            collection_signing={collection_signing}
            setIsCommunityRemote={setIsCommunityRemote}
          />
          <PageFormSection singleColumn>
            <RequirementsFile isCommunityRemote={isCommunityRemote} />
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

function isHiddenField(key: keyof RemoteFormProps): key is AllowedHiddenFields {
  return HiddenFields.includes(key as AllowedHiddenFields);
}

type RemoteFormPropsKey = keyof RemoteFormProps;
function smartUpdate(modifiedRemote: RemoteFormProps, unmodifiedRemote: RemoteFormProps) {
  // Adapted from https://github.com/ansible/ansible-hub-ui/blob/625157662113cd68c3b121508fa8f64613339a71/src/api/ansible-remote.ts#L5
  if (modifiedRemote.my_permissions) {
    delete modifiedRemote.my_permissions;
  }

  /**
   * When a field is clear ('' or null):
   * - If it has been explicitly cleared in the edit, record the null or '' value in the response
   * - If it was unchanged, delete it from the response
   */
  Object.keys(modifiedRemote).forEach((key) => {
    const propKey = key as RemoteFormPropsKey;

    if (modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null) {
      if (isHiddenField(propKey)) {
        if (
          unmodifiedRemote?.hidden_fields?.find((field) => field.name === propKey)?.is_set ===
          modifiedRemote?.hidden_fields?.find((field) => field.name === propKey)?.is_set
        ) {
          delete modifiedRemote[propKey];
        } else {
          modifiedRemote[propKey] = null;
        }
      } else {
        if (unmodifiedRemote[propKey] === '' || unmodifiedRemote[propKey] === null) {
          delete modifiedRemote[propKey];
        } else if (modifiedRemote[propKey] === '') {
          // @ts-expect-error Unable to override error Type 'null' is not assignable to type 'never'.
          modifiedRemote[propKey] = null;
        }
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
    if (!isHiddenField(field)) {
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
  const [isCommunityRemote, setIsCommunityRemote] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { clearCacheByKey } = useClearCache();

  const { data, error, refresh, isLoading } = useGet<PulpItemsResponse<HubRemote>>(
    pulpAPI`/remotes/ansible/collection/?name=${name}`
  );
  const remote = data?.results[0];

  const getPageUrl = useGetPageUrl();

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

    // If requirements_file is an empty string, set it to null
    if (updatedRemote.requirements_file === '') {
      updatedRemote.requirements_file = null;
    } else if (compareYaml(updatedRemote.requirements_file ?? '', yamlRequirementsTemplate)) {
      // If it matches the default template, delete the field
      delete updatedRemote.requirements_file;
    }

    await hubAPIPut<RemoteFormProps>(
      pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(modifiedRemote.pulp_href)}/`,
      updatedRemote
    );

    clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
    pageNavigate(HubRoute.RemoteDetails, {
      params: { id: name },
    });
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
        requirements_file: yamlRequirementsTemplate,
      };
    }
    return remoteValues;
  }
  const remoteDefaultValues = {
    ...initialRemote,
    ...updateRemoteRequirements(remote!),
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
          setIsCommunityRemote={setIsCommunityRemote}
        />{' '}
        <PageFormSection singleColumn>
          <RequirementsFile isCommunityRemote={isCommunityRemote} />
        </PageFormSection>
        <PageFormExpandableSection singleColumn>
          <ProxyAdvancedRemoteInputs />
          <CertificatesAdvancedRemoteInputs />
          <MiscAdvancedRemoteInputs />
        </PageFormExpandableSection>
      </HubPageForm>
    </PageLayout>
  );
}
