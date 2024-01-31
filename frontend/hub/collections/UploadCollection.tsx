import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl, usePageNavigate } from '../../../framework';
import { PageFormAsyncSingleSelect } from '../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { useSearchParams } from '../../../framework/components/useSearchParams';
import { requestGet } from '../../common/crud/Data';
import { RequestError } from '../../common/crud/RequestError';
import { useGetRequest } from '../../common/crud/useGet';
import { useRepositories } from '../administration/repositories/hooks/useRepositories';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { hubPostRequestFile } from '../common/api/request';
import { HubItemsResponse, PulpItemsResponse } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { HubNamespace } from '../namespaces/HubNamespace';
import { useSelectRepositorySingle } from '../administration/repositories/hooks/useRepositorySelector';
import { Button, PageSection } from '@patternfly/react-core';
import { Repository } from '../administration/repositories/Repository';
import { AnsibleAnsibleRepositoryResponse } from '../interfaces/generated/AnsibleAnsibleRepositoryResponse';
import { useGet } from '../../common/crud/useGet';

interface UploadData {
  file: File;
  repository: string;
}

export interface Distribution {
  base_path: string;
}

export function UploadCollection() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Upload Collection')}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: t('Upload Collection') },
        ]}
      />
      <UploadCollectionByFile />
    </PageLayout>
  );
}

export function UploadCollectionByFile() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const namespaceParams = searchParams.get('namespace');
  const repositories = useRepositories();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const onCancel = () => navigate(-1);
  const distroGetRequest = useGetRequest<PulpItemsResponse<Distribution>>();
  const selectRepositorySingle = useSelectRepositorySingle();

  const stagingRepo = useGet<PulpItemsResponse<Repository>>(
    pulpAPI`/repositories/ansible/ansible/?name=staging`
  );

  const onSubmit = useCallback(
    async (data: UploadData) => {
      const namespaceName = data.file?.name.split('-')[0] ?? '';
      if (namespaceParams && namespaceName !== namespaceParams) {
        const message = t(
          `Namespace "{{namespaceName}}" does not match namespace "{{namespaceParams}}"`,
          { namespaceName, namespaceParams }
        );
        throw new RequestError({ message, json: { file: message } });
      }

      const namespace = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/namespaces/?limit=1&name=${namespaceName}`
      ).catch(() => {
        const message = t('Error loading namespace {{namespaceName}}', { namespaceName });
        throw new RequestError({ message, json: { file: message } });
      });

      if (namespace.data.length === 0) {
        const message = t(
          'Cannot find namespace {{namespaceName}}. Create namespace before uploading.',
          { namespaceName }
        );
        throw new RequestError({ message, json: { file: message } });
      }

      const repositoryGet = await requestGet<PulpItemsResponse<Repository>>(
        pulpAPI`/repositories/ansible/ansible/?name=${data.repository}`
      ).catch(() => {
        const message = t('Error loading repository');
        throw new RequestError({ message, json: { repository: message } });
      });

      if (repositoryGet?.results?.length === 0) {
        const message = t('Cannot find repository');
        throw new RequestError({ message, json: { repository: message } });
      }

      const list = await distroGetRequest(
        pulpAPI`/distributions/ansible/ansible/?repository=${
          repositoryGet.results[0].pulp_href || ''
        }`
      ).catch(() => {
        const message = t('Error loading distribution for selected repository');
        throw new RequestError({ message, json: { repository: message } });
      });

      if (list?.results.length === 0) {
        const message = t('Cannot find distribution for selected repository');
        throw new RequestError({ message, json: { repository: message } });
      }

      const base_path = list?.results[0]?.base_path;

      await hubPostRequestFile(
        hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
        data.file as Blob
      );

      pageNavigate(HubRoute.Approvals);
    },
    [distroGetRequest, namespaceParams, pageNavigate, t]
  );

  const queryRepositories = useCallback(
    async (page: number, signal: AbortSignal) => {
      const perPage = 100;
      const response = await requestGet<PulpItemsResponse<Repository>>(
        pulpAPI`/repositories/ansible/ansible/?offset=${(
          (page - 1) *
          perPage
        ).toString()}&limit=${perPage.toString()}`,
        signal
      );
      return Promise.resolve({
        total: response.count,
        options:
          response.results?.map((repository) => ({
            label: repository.name,
            value: repository.name,
            description: repository.description,
            group:
              repository.pulp_labels.pipeline === 'staging'
                ? t`Staging Repos`
                : t`Repositories without pipeline`,
          })) ?? [],
      });
    },
    [t]
  );

  if (!stagingRepo.data && !repositories.error) {
    return <LoadingPage />;
  }

  if (stagingRepo.data && stagingRepo.data.results?.length !== 1) {
    return (
      <HubError
        error={{ name: '', message: t(`Can not find repository staging`) }}
        handleRefresh={repositories.refresh}
      />
    );
  }

  if (!repositories.data && !repositories.error) {
    return <LoadingPage />;
  }

  if (stagingRepo.error) {
    return <HubError error={stagingRepo.error} handleRefresh={stagingRepo.refresh} />;
  }

  if (repositories.error) {
    return <HubError error={repositories.error} handleRefresh={repositories.refresh} />;
  }

  return (
    <>
      <PageSection>
        {t(
          `Please note that these repositories are not filtered by permissions. Upload may fail without the right permissions.`
        )}
      </PageSection>
      <HubPageForm<UploadData>
        submitText={t('Upload')}
        onCancel={onCancel}
        onSubmit={onSubmit}
        singleColumn={true}
        defaultValue={{ repository: 'staging' }}
      >
        <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
        <PageFormAsyncSingleSelect<UploadData>
          label={t('Repository')}
          name="repository"
          placeholder={t('Select repository (staging is default)')}
          queryOptions={queryRepositories}
          queryPlaceholder={t('Loading repositories...')}
          queryErrorText={t('Error loading repositories')}
          isRequired
          getLabel={(value) => value as string}
          renderFooter={(value, onChange) => {
            return (
              <Button
                variant="link"
                onClick={() => {
                  selectRepositorySingle.openBrowse(
                    (selection) => {
                      onChange(selection.name);
                    },
                    { name: value } as AnsibleAnsibleRepositoryResponse
                  );
                }}
              >
                {t`Browse`}
              </Button>
            );
          }}
        />
      </HubPageForm>
    </>
  );
}
