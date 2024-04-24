import { Label } from '@patternfly/react-core';
import { ReactNode, useCallback } from 'react';
import { FieldValues, UseFormSetValue, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
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
import { PageFormAsyncSelect } from '../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { HubPageForm } from '../../common/HubPageForm';
import { pulpAPI } from '../../common/api/formatPath';
import {
  parsePulpIDFromURL,
  useRepositoryBasePath,
  waitForTask,
} from '../../common/api/hub-api-utils';
import { postHubRequest, putHubRequest } from '../../common/api/request';
import { PulpItemsResponse } from '../../common/useHubView';
import { HubRoute } from '../../main/HubRoutes';
import { HubRemote } from './../remotes/Remotes';
import { Repository } from './Repository';
import { useSelectRemoteSingle } from './hooks/useRemoteSelector';

interface RepositoryFormProps {
  remote: HubRemote | string | null;
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
      const remote = data.remote as HubRemote;
      payload.remote = remote.pulp_href;
    }

    const getDistribution = (repositoryPulpHref: string) => {
      const basePathTransform = (name: string) => name.replaceAll(/[^-a-zA-Z0-9_/]/g, '_');
      let distributionName: string = data?.name || '';
      return postHubRequest(pulpAPI`/distributions/ansible/ansible/`, {
        base_path: basePathTransform(distributionName),
        name: data.name,
        repository: repositoryPulpHref,
      }).catch(() => {
        // if distribution already exists, try a numeric suffix to name & base_path
        distributionName = data.name || '' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        return postHubRequest(pulpAPI`/distributions/ansible/ansible/`, {
          base_path: basePathTransform(distributionName),
          name: data.name,
          repository: repositoryPulpHref,
        });
      });
    };

    const promise = isEdit
      ? putHubRequest(
          pulpAPI`/repositories/ansible/ansible/${
            parsePulpIDFromURL(repo?.pulp_href || '') || ''
          }/`,
          payload
        )
      : postHubRequest<Repository>(pulpAPI`/repositories/ansible/ansible/`, payload);

    return promise
      .catch(() => {
        throw new Error(t('Repository not created.'));
      })
      .then((result) => {
        const pulp_href = (result as { response: { pulp_href: string } })?.response?.pulp_href;

        let distroPromise = undefined;
        if (data.createDistribution && !error) {
          if (isEdit) {
            distroPromise = getDistribution(repo?.pulp_href || '');
          } else {
            distroPromise = getDistribution(pulp_href || '');
          }

          return distroPromise
            .then((result) => {
              return waitForTask(
                parsePulpIDFromURL((result as { response: { task: string } }).response.task)
              );
            })
            .catch(() => {
              throw new Error(t('Distribution not created.'));
            });
        }
      })
      .then(() => pageNavigate(HubRoute.RepositoryPage, { params: { id: data.name as string } }))
      .catch((error) => {
        throw new Error(error as string);
      });
  };
  const { data, isLoading, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    id ? pulpAPI`/repositories/ansible/ansible/?name=${id}` : ''
  );
  if (data) {
    repo = data?.results[0];
  } else {
    repo = null;
  }
  // FIXME this should be replaced by typeahead component once it's implemented
  const page_size = 50;
  const remote = useGet<PulpItemsResponse<HubRemote>>(
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

  if (isLoading || baseLoading) {
    return <LoadingPage breadcrumbs />;
  }
  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const getRemote = (url: string): HubRemote | null => {
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
        submitText={isEdit ? t('Save repository') : t('Create repository')}
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
          <PageFormWatch<RepositoryFormProps, 'name'> watch="name">
            {(name) => {
              return (
                <PageFormCheckbox<RepositoryFormProps>
                  name="createDistribution"
                  label={t(`Create a "${name}" distribution`)}
                  isDisabled={isDistributionDisabled}
                />
              );
            }}
          </PageFormWatch>
        </PageFormGroup>
        <PageFormSelect
          name={'pipeline'}
          label={t('Pipeline')}
          labelHelp={t(
            'Pipeline adds repository labels with pre-defined meanings: None - users require permissions to modify content in this repository to upload collection. Approved - collections can be moved here on approval. Publishing directly to this repository is disabled. Staging - collections uploaded here require approval before showing up on the search page. Anyone with upload permissions for a namespace can upload collections to this repository'
          )}
          placeholderText={t('Select a pipeline')}
          isRequired
          options={[
            { value: 'none', label: t('None') },
            { value: 'approved', label: t('Approved') },
            { value: 'staging', label: t('Staging') },
          ]}
        />
        <PageFormGroup
          label={t('Labels')}
          labelHelp={t(
            'Repository labels can change the context in which a repository is seen.\n' +
              'Hide from search (hide_from_search) - prevent collections in this repository from showing up on the home page\n' +
              '(pipeline: *) - see Pipeline above'
          )}
          additionalControls={
            <PageFormWatch<RepositoryFormProps, 'pipeline'> watch="pipeline">
              {(pipeline) => {
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
          }
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
          valueToString={(value: HubRemote) => {
            return value.name;
          }}
          openSelectDialog={remoteSelector}
        />
      </HubPageForm>
    </PageLayout>
  );
}
