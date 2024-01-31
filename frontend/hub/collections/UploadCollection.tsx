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

interface UploadData {
  file: File;
  repository: string;
}

export interface Repository {
  name: string;
  description?: string;
  pulp_id: string;
  pulp_href: string;
  pulp_last_updated: string;
  content_count: number;
  gpgkey: string | null;
  pulp_labels: {
    pipeline: string;
  };
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

      const list = await distroGetRequest(
        pulpAPI`/distributions/ansible/ansible/?repository=${data.repository || ''}`
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
            value: repository.pulp_href,
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

  if (!repositories.data && !repositories.error) {
    return <LoadingPage />;
  }

  if (repositories.error) {
    return <HubError error={repositories.error} handleRefresh={repositories.refresh} />;
  }

  return (
    <HubPageForm<UploadData>
      submitText={t('Upload')}
      onCancel={onCancel}
      onSubmit={onSubmit}
      singleColumn={true}
    >
      <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
      <PageFormAsyncSingleSelect<UploadData>
        label={t('Repository')}
        name="repository"
        placeholder={t('Select repository')}
        queryOptions={queryRepositories}
        queryPlaceholder={t('Loading repositories...')}
        queryErrorText={t('Error loading repositories')}
        isRequired
      />
    </HubPageForm>
  );
}
