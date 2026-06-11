import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormExpandableSection } from '@ansible/ansible-ui-framework/PageForm/PageFormExpandableSection';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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

export type HiddenFieldsType = {
  name: 'client_key' | 'password' | 'proxy_password' | 'proxy_username' | 'token' | 'username';
  is_set: boolean;
}[];

export interface RemoteFormProps extends HubRemote {
  client_key?: string | null;
  password?: string | null;
  proxy_password?: string | null;
  proxy_username?: string | null;
  token?: string | null;
  username?: string | null;
}

export function CreateRemote() {
  const { t } = useTranslation();
  const { clearCacheByKey } = useClearCache();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<HubRemote>();

  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (remote) => {
    const url: string = remote.url && appendTrailingSlash(remote.url);

    // fixes fields that are only required when present
    ['username', 'password', 'proxy_username', 'proxy_password', 'proxy_url', 'token'].forEach(
      (field) => {
        // @ts-expect-error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'RemoteFormProps'.
        if (remote[field] === '') {
          // @ts-expect-error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'RemoteFormProps'.
          delete remote[field];
        }
      }
    );

    const createdRemote = await postRequest(pulpAPI`/remotes/ansible/collection/`, {
      ...remote,
      url,
    });

    clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
    pageNavigate(HubRoute.RemotePage, { params: { id: createdRemote?.name ?? remote.name } });
  };

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
        onCancel={() => void navigate(-1)}
        defaultValue={{
          name: '',
          url: '',
          signed_only: false,
          sync_dependencies: false,
        }}
      >
        <HelperWrapper isNew />
      </HubPageForm>
    </PageLayout>
  );
}

// defaults for hidden fields
const initialRemote: Partial<RemoteFormProps> = {
  client_key: null,
  password: null,
  proxy_password: null,
  proxy_username: null,
  token: null,
  username: null,
};

type RemoteKey = keyof RemoteFormProps;

function smartUpdate(modifiedRemote: RemoteFormProps, unmodifiedRemote: RemoteFormProps) {
  const getHiddenField = (key: RemoteKey, from: RemoteFormProps) =>
    from?.hidden_fields?.find((field) => field.name === key);
  const isHiddenField = (key: RemoteKey) => !!getHiddenField(key, unmodifiedRemote);

  /**
   * When a field is clear ('' or null):
   * - If it has been explicitly cleared in the edit, record the null or '' value in the response
   * - If it was unchanged, delete it from the response
   */
  (Object.keys(modifiedRemote) as RemoteKey[]).forEach((propKey) => {
    const isEmpty = modifiedRemote[propKey] === '' || modifiedRemote[propKey] === null;
    const wasEmpty = unmodifiedRemote[propKey] === '' || unmodifiedRemote[propKey] === null;
    const unchanged = isHiddenField(propKey)
      ? getHiddenField(propKey, unmodifiedRemote)?.is_set ===
        getHiddenField(propKey, modifiedRemote)?.is_set
      : wasEmpty;

    if (!isEmpty) {
      return;
    }

    if (unchanged) {
      delete modifiedRemote[propKey];
    } else {
      // @ts-expect-error TS2322: Type 'null' is not assignable to type 'never'.
      modifiedRemote[propKey] = null;
    }
  });

  // Pulp complains if auth_url gets sent with a request that doesn't include a
  // valid token, even if the token exists in the database and isn't being changed.
  // To solve this issue, simply delete auth_url from the request if it hasn't
  // been updated by the user.
  if (modifiedRemote.auth_url === unmodifiedRemote.auth_url) {
    delete modifiedRemote.auth_url;
  }

  const keys = Object.keys(modifiedRemote) as RemoteKey[];
  for (const field of keys) {
    if (
      !isHiddenField(field) &&
      modifiedRemote[field] === null &&
      unmodifiedRemote[field] === null
    ) {
      // API returns headers: null but doesn't accept it .. and we don't edit headers
      delete modifiedRemote[field];
    }
  }

  return modifiedRemote;
}

export function EditRemote() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const { clearCacheByKey } = useClearCache();

  const name = params.id;
  const { data, error, refresh, isLoading } = useGet<PulpItemsResponse<HubRemote>>(
    name ? pulpAPI`/remotes/ansible/collection/?name=${name}` : undefined
  );

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  if (!data || isLoading) {
    return <LoadingPage breadcrumbs tabs />;
  }

  const remote = data?.results[0];

  const handleRefresh = () => {
    // Navigate back when remote is not found
    if (!error && !remote) {
      void navigate(-1);
    }
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

  const onSubmit: PageFormSubmitHandler<RemoteFormProps> = async (modifiedRemote) => {
    const updatedRemote = smartUpdate(modifiedRemote, remote);

    // If requirements_file is empty, set to null
    if (!updatedRemote.requirements_file || updatedRemote.requirements_file.trim() === '') {
      updatedRemote.requirements_file = null;
    }

    await hubAPIPut<RemoteFormProps>(
      pulpAPI`/remotes/ansible/collection/${parsePulpIDFromURL(remote.pulp_href)}/`,
      updatedRemote
    );

    clearCacheByKey(pulpAPI`/remotes/ansible/collection/`);
    pageNavigate(HubRoute.RemoteDetails, {
      params: { id: name },
    });
  };

  const remoteDefaultValues = {
    ...initialRemote,
    ...remote,
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
        onCancel={() => void navigate(-1)}
        defaultValue={remoteDefaultValues}
      >
        <HelperWrapper />
      </HubPageForm>
    </PageLayout>
  );
}

function HelperWrapper({ isNew }: Readonly<{ isNew?: boolean }>) {
  const { getValues, resetField, setValue } = useFormContext();
  const {
    featureFlags: { collection_signing },
  } = useHubContext();
  const [isCommunityRemote, setIsCommunityRemote] = useState(false);
  const [reload, setReload] = useState(0);

  const handleOnClear = (name: string) => {
    resetField(name, { defaultValue: null });

    // resetField nor setValue cause a re-render, force it
    setReload(reload + 1);

    const hiddenFields = getValues('hidden_fields') as HiddenFieldsType;
    if (!hiddenFields) {
      return;
    }

    const field = hiddenFields.find((field) => field.name === name);
    if (field) {
      field.is_set = false;
      setValue('hidden_fields', hiddenFields);
    }
  };

  const shouldHideField = (name: string) => {
    const hiddenFields = getValues('hidden_fields') as HiddenFieldsType;
    if (!hiddenFields) {
      return false;
    }

    return !!hiddenFields.find((field) => field.name === name)?.is_set;
  };

  return (
    <>
      <RemoteInputs
        collection_signing={collection_signing}
        disableEditName={!isNew}
        handleOnClear={handleOnClear}
        isCommunityRemote={isCommunityRemote}
        setIsCommunityRemote={setIsCommunityRemote}
        shouldHideField={shouldHideField}
      />
      <PageFormSection singleColumn>
        <RequirementsFile isRequired={isCommunityRemote} />
      </PageFormSection>
      <PageFormExpandableSection singleColumn>
        <ProxyAdvancedRemoteInputs
          handleOnClear={handleOnClear}
          shouldHideField={shouldHideField}
        />
        <CertificatesAdvancedRemoteInputs
          handleOnClear={handleOnClear}
          shouldHideField={shouldHideField}
        />
        <MiscAdvancedRemoteInputs />
      </PageFormExpandableSection>
    </>
  );
}
