import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LoadingPage,
  PageFormCheckbox,
  PageFormSelect,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { HubPageForm } from '../../common/HubPageForm';
import { HubRoute } from '../../main/HubRoutes';
import { pulpAPI } from '../../common/api/formatPath';
import { IRemotes } from './../remotes/Remotes';
import { useParams } from 'react-router';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { useGet } from '../../../common/crud/useGet';
import { PulpItemsResponse } from '../../common/useHubView';
import { Repository } from './Repository';
import { Label } from '@patternfly/react-core';
import { PageFormAsyncSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { useCallback, ReactNode } from 'react';
import { useSelectRemoteSingle } from './hooks/useRemoteSelector';
import { useRepositoryBasePath, parsePulpIDFromURL } from '../../common/api/hub-api-utils';
import { postHubRequest, putHubRequest } from '../../common/api/request';
import { postRequest } from '../../../common/crud/Data';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { useFormContext, UseFormSetValue, FieldValues } from 'react-hook-form';

interface RepositoryFormProps {
  remote: IRemotes | string | null;
  name: string | null;
  description: string | null;
  retain_repo_versions: number | null;
  private: boolean | null;
  pipeline?: string;
  hide_from_search?: boolean | null;
  createDistribution?: boolean;
  pulp_labels: Record<string, string>;
}

export function RepositoryForm() {
  const { id } = useParams();
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const isEdit = !!id;
  let isDistributionDisabled = false;
  let repo: Repository | null;
  const onSubmit = (data: RepositoryFormProps) => {
    // format inputs to correct payload
    const payload = { ...data };
    if (payload.description === '') {
      payload.description = null;
    }
    delete payload.pipeline;
    delete payload.hide_from_search;
    delete payload.createDistribution;
    payload.pulp_labels = {};
    if (data.hide_from_search) {
      payload.pulp_labels.hide_from_search = '';
    }
    if (data.pipeline && data.pipeline !== 'none') {
      payload.pulp_labels.pipeline = data.pipeline;
    }
    if (data.remote) {
      const remote = data.remote as IRemotes;
      payload.remote = remote.pulp_href;
    }

    const promise = isEdit
      ? putHubRequest(
          pulpAPI`/repositories/ansible/ansible/${
            parsePulpIDFromURL(repo?.pulp_href || '') || ''
          }/`,
          payload
        ).then(() => repo?.pulp_href || '')
      : postRequest<{ response: Repository }>(
          pulpAPI`/repositories/ansible/ansible/`,
          payload
        ).then((value) => value?.response?.pulp_href || '');
    if (data.createDistribution) {
      const basePathTransform = (name: string) => name.replaceAll(/[^-a-zA-Z0-9_/]/g, '_');
      let distributionName: string = data?.name || '';
      promise
        .then((pulp_href: string) => {
          postHubRequest(pulpAPI`/distributions/ansible/ansible/`, {
            base_path: basePathTransform(distributionName),
            name: data.name,
            repository: pulp_href,
          }).catch(() => {
            // if distribution already exists, try a numeric suffix to name & base_path
            distributionName =
              data.name || '' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            return postHubRequest(pulpAPI`/distributions/ansible/ansible/`, {
              base_path: basePathTransform(distributionName),
              name: data.name,
              repository: pulp_href,
            });
          });
        })
        .catch((error: unknown) => error);
    }
    return promise
      .then(() => pageNavigate(HubRoute.RepositoryPage, { params: { id: data.name as string } }))
      .catch(() => t('The changes not saved.'));
  };
  const { data } = useGet<PulpItemsResponse<Repository>>(
    id ? pulpAPI`/repositories/ansible/ansible/?name=${id}` : ''
  );
  if (data) {
    repo = data?.results[0];
  } else {
    repo = null;
  }
  const page_size = 50;
  const remote = useGet<PulpItemsResponse<IRemotes>>(
    pulpAPI`/remotes/ansible/collection/?offset=0&limit=${page_size.toString()}`
  );
  const query = useCallback(() => {
    return Promise.resolve({
      total: remote?.data?.count || 0,
      values: remote?.data?.results || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote.data]);

  const selectRemoteSingle = useSelectRemoteSingle();
  const remoteSelector = selectRemoteSingle.openBrowse;

  const { basePath: baseData, loading: baseLoading } = useRepositoryBasePath(
    repo?.name || '',
    repo?.pulp_href || undefined
  );

  if ((isEdit && !repo) || baseLoading) {
    return <LoadingPage />;
  }

  const getRemote = (url: string): IRemotes | null => {
    return remote?.data?.results?.find((r) => r.pulp_href === url) || null;
  };
  if (!baseLoading && !!baseData && isEdit) {
    isDistributionDisabled = true;
  }

  const repositoryFormValues: RepositoryFormProps = {
    name: repo?.name || '',
    description: repo?.description || null,
    retain_repo_versions: repo?.retain_repo_versions || 1,
    private: repo?.private || false,
    pipeline: repo?.pulp_labels?.pipeline || 'none',
    hide_from_search: repo?.pulp_labels
      ? Object.keys(repo.pulp_labels).includes('hide_from_search')
      : false,
    remote: repo?.remote ? getRemote(repo.remote) : null,
    pulp_labels: repo?.pulp_labels || {},
    createDistribution: !isDistributionDisabled,
  };
  function HookWrapper<TFieldValues extends FieldValues>(props: {
    children: (value: UseFormSetValue<TFieldValues>) => ReactNode;
  }) {
    const { setValue } = useFormContext<TFieldValues>();
    return <>{props.children(setValue)}</>;
  }
  return (
    <PageLayout>
      <PageHeader
        title={isEdit ? t('Edit Repository') : t('Create Repository')}
        breadcrumbs={[
          { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
          { label: isEdit ? t('Edit Repository') : t('Create Repository') },
        ]}
      />
      <HubPageForm<RepositoryFormProps>
        submitText={isEdit ? t('Edit Repository') : t('Create Repository')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={repositoryFormValues}
      >
        <PageFormTextInput<RepositoryFormProps>
          name="name"
          label={t('Name')}
          placeholder={t('Enter a repository name')}
          isDisabled={isEdit}
          isRequired
        />
        <PageFormTextInput<RepositoryFormProps>
          name="description"
          label={t('Description')}
          placeholder={t('Enter a repository description')}
        />
        <PageFormTextInput<RepositoryFormProps>
          name="retain_repo_versions"
          type="number"
          min={1}
          label={t('Retained number of versions')}
          placeholder={t('Enter a number of versions')}
        />
        <PageFormGroup
          label={t('Distributions')}
          labelHelp={t(
            'Content in repositories without a distribution will not be visible to clients for sync, download or search.'
          )}
        >
          <PageFormCheckbox<RepositoryFormProps>
            name="createDistribution"
            label={t(`Create a "${repositoryFormValues.name}" distribution`)}
            isDisabled={isDistributionDisabled}
          />
        </PageFormGroup>
        <PageFormGroup
          label={t('Pipeline')}
          labelHelp={t(
            'Pipeline adds repository labels with pre-defined meanings: None - users require permissions to modify content in this repository to upload collection. Approved - collections can be moved here on approval. Publishing directly to this repository is disabled. Staging - collections uploaded here require approval before showing up on the search page. Anyone with upload permissions for a namespace can upload collections to this repository'
          )}
        >
          <PageFormSelect
            name={'pipeline'}
            placeholderText={t('Select a pipeline')}
            isRequired
            options={[
              { value: 'none', label: t('None') },
              { value: 'approved', label: t('Approved') },
              { value: 'staging', label: t('Staging') },
            ]}
          />
        </PageFormGroup>
        <PageFormGroup
          label={t('Labels')}
          labelHelp={t(
            'Repository labels can change the context in which a repository is seen.\n' +
              'Hide from search (hide_from_search) - prevent collections in this repository from showing up on the home page\n' +
              '(pipeline: *) - see Pipeline above'
          )}
        >
          {Object.keys(repositoryFormValues?.pulp_labels).map((label) => (
            <Label key={label}>
              {label}
              {repositoryFormValues.pulp_labels[label] &&
                `: ${repositoryFormValues.pulp_labels[label]}`}
            </Label>
          ))}
          {Object.keys(repositoryFormValues?.pulp_labels).length === 0 && t('None')}
          <br />
          <PageFormWatch<string> watch={'pipeline'}>
            {(pipeline: string) => {
              return (
                <HookWrapper>
                  {(setValue) => {
                    if (pipeline === 'staging') {
                      // eslint-disable-next-line i18next/no-literal-string
                      setValue('hide_from_search', true);
                    } else {
                      // eslint-disable-next-line i18next/no-literal-string
                      setValue('hide_from_search', false);
                    }
                    return (
                      <PageFormCheckbox<RepositoryFormProps>
                        name="hide_from_search"
                        label={t('Hide from search')}
                        isDisabled={pipeline === 'staging'}
                      />
                    );
                  }}
                </HookWrapper>
              );
            }}
          </PageFormWatch>
        </PageFormGroup>
        <PageFormGroup label={t('Private')} labelHelp={t('Make the repository private.')}>
          <PageFormCheckbox<RepositoryFormProps> name="private" label={t('Make private')} />
        </PageFormGroup>
        <PageFormAsyncSelect<RepositoryFormProps>
          name="remote"
          label={t('Remote')}
          labelHelp={t('Setting a remote allows a repository to sync from elsewhere.')}
          placeholder={t('Select a remote')}
          query={query}
          loadingPlaceholder={t('Loading remote...')}
          loadingErrorText={t('Error loading remote')}
          limit={page_size}
          valueToString={(value: IRemotes) => {
            return value.name;
          }}
          openSelectDialog={remoteSelector}
        />
      </HubPageForm>
    </PageLayout>
  );
}
