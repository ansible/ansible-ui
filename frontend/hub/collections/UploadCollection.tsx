import {
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilter';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import { nameKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { Radio } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRepositories } from '../administration/repositories/hooks/useRepositories';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { getRepositoryBasePath } from '../common/api/hub-api-utils';
import { isInsightsMode } from '../common/isInsights';
import { hubPostRequestFile } from '../common/api/request';
import { HubItemsResponse, PulpItemsResponse, useHubView } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { HubNamespace } from '../namespaces/HubNamespace';

interface UploadData {
  file: File;
}

export interface Repository {
  name: string;
  description?: string;
  pulp_id: string;
  pulp_href: string;
  pulp_last_updated: string;
  content_count: number;
  gpgkey: string | null;
}

export interface Distribution {
  base_path: string;
  name: string;
  pulp_created: string;
  client_url: string;
}

export function UploadCollection() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Upload collection')}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: t('Upload collection') },
        ]}
      />
      {isInsightsMode() ? <InsightsUploadCollectionByFile /> : <PlatformUploadCollectionByFile />}
    </PageLayout>
  );
}

/**
 * Insights mode upload component - file upload with repository selector.
 * Namespace is derived from the collection filename (namespace-collection-version.tar.gz)
 * and validated against my-namespaces API for upload permission.
 */
function InsightsUploadCollectionByFile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const [searchParams] = useURLSearchParams();
  const namespaceParams = searchParams.get('namespace');
  const onCancel = () => void navigate(-1);
  const [error, setError] = useState<string>('');
  const [onlyStaging, setOnlyStaging] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<{ name: string; pulp_href: string } | null>(
    null
  );
  const toolbarFilters = useRepoFilters();
  const tableColumns = useRepositoriesColumns();

  // Repository list view - filters by staging or non-pipeline repos
  const view = useHubView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: nameKeyFn,
    toolbarFilters,
    tableColumns,
    queryParams: onlyStaging
      ? {
          pulp_label_select: 'pipeline=staging',
        }
      : {
          pulp_label_select: '!pipeline',
        },
  });

  // Auto-select staging repo when in staging mode
  useEffect(() => {
    if (selectedRepo) {
      return;
    }

    const item = view.pageItems?.find((item) => item.name === 'staging');
    if (item) {
      setSelectedRepo({ name: 'staging', pulp_href: item.pulp_href });
      view.selectItem(item);
    }
  }, [view.pageItems, selectedRepo, view]);

  async function submitData(data: UploadData) {
    setError('');

    if (!data.file) {
      setError(t('Please select the file to be uploaded.'));
      return;
    }

    if (!selectedRepo) {
      setError(t('Please select a repository.'));
      return;
    }

    const namespaceName = data.file.name.split('-')[0] ?? '';

    // Validate namespace matches URL param if coming from namespace detail page
    if (namespaceParams && namespaceName !== namespaceParams) {
      setError(
        t('Namespace "{{namespaceName}}" does not match namespace "{{namespaceParams}}".', {
          namespaceName,
          namespaceParams,
        })
      );
      return;
    }

    let lastError = '';
    try {
      // Validate namespace exists and user has upload permission
      lastError = t('Error checking namespace "{{namespaceName}}".', { namespaceName });
      const namespaceResponse = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/my-namespaces/?limit=1&name=${namespaceName}&include_related=my_permissions`
      );

      if (namespaceResponse.data.length === 0) {
        setError(
          t(
            'Namespace "{{namespaceName}}" not found or you do not have permission to upload to it.',
            { namespaceName }
          )
        );
        return;
      }

      const namespace = namespaceResponse.data[0];
      if (!namespace.related_fields?.my_permissions?.includes('galaxy.upload_to_namespace')) {
        setError(
          t('You do not have permission to upload to namespace "{{namespaceName}}".', {
            namespaceName,
          })
        );
        return;
      }

      // In Insights mode, use getRepositoryBasePath which first tries to find a distribution
      // with the same name as the repository (e.g., "staging"), avoiding synclist distributions
      // that may be returned first when querying by repository pulp_href alone
      lastError = t('Can not find distribution for selected repository.');
      const base_path = await getRepositoryBasePath(selectedRepo.name, selectedRepo.pulp_href, t);

      if (!base_path) {
        setError(lastError);
        return;
      }

      lastError = t('Error occurred during collection upload.');
      await hubPostRequestFile(
        hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
        data.file as Blob
      );

      if (onlyStaging) {
        pageNavigate(HubRoute.Approvals);
      } else {
        pageNavigate(HubRoute.Collections);
      }
    } catch (err) {
      setError(lastError + (err instanceof Error ? err.message : String(err)));
    }
  }

  function renderRepoSelector() {
    return (
      <>
        <Radio
          isChecked={onlyStaging}
          name="radio-staging"
          onChange={(_event, val) => {
            setOnlyStaging(val);
            setSelectedRepo(null);
          }}
          label={t`Staging Repos`}
          id="radio-staging"
        />
        <Radio
          isChecked={!onlyStaging}
          name="radio-all"
          onChange={(_event, val) => {
            setOnlyStaging(!val);
            setSelectedRepo(null);
          }}
          label={t`All Repos`}
          id="radio-all"
        />
        <div>
          {!onlyStaging && (
            <>
              {t`Please note that these repositories are not filtered by permissions. Upload may fail without the right permissions.`}
            </>
          )}
        </div>

        <PageTable<Repository>
          id="hub-repositories-table"
          onSelect={(repo) => {
            setSelectedRepo({ name: repo.name, pulp_href: repo.pulp_href });
          }}
          disableListView={true}
          disableCardView={true}
          tableColumns={tableColumns}
          compact={true}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading repositories')}
          emptyStateTitle={t('No repositories yet')}
          emptyStateDescription={t('To get started, create a repository.')}
          defaultTableView="table"
          {...view}
        />
      </>
    );
  }

  return (
    <HubPageForm<UploadData>
      submitText={t('Upload collection')}
      cancelText={t('Cancel')}
      onCancel={onCancel}
      onSubmit={submitData}
      disableSubmitOnEnter={true}
      singleColumn={true}
    >
      <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
      {error && <HubError error={{ name: '', message: error }} />}
      {renderRepoSelector()}
    </HubPageForm>
  );
}

/**
 * Platform mode upload component - shows repository selector (existing behavior)
 */
function PlatformUploadCollectionByFile() {
  const { t } = useTranslation();

  const [searchParams] = useURLSearchParams();
  const namespaceParams = searchParams.get('namespace');
  const repositories = useRepositories();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const onCancel = () => void navigate(-1);
  const toolbarFilters = useRepoFilters();
  const tableColumns = useRepositoriesColumns();
  const [onlyStaging, setOnlyStaging] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<{ name: string; pulp_href: string } | null>(
    null
  );
  const distroGetRequest = useGetRequest<PulpItemsResponse<Distribution>>();
  const [error, setError] = useState<string>('');

  const view = useHubView<Repository>({
    url: pulpAPI`/repositories/ansible/ansible/`,
    keyFn: nameKeyFn,
    toolbarFilters,
    tableColumns,
    queryParams: onlyStaging
      ? {
          pulp_label_select: 'pipeline=staging',
        }
      : {
          pulp_label_select: '!pipeline',
        },
  });

  useEffect(() => {
    if (selectedRepo) {
      return;
    }

    const item = view.pageItems?.find((item) => item.name === 'staging');
    if (item) {
      setSelectedRepo({ name: 'staging', pulp_href: item.pulp_href });
      view.selectItem(item);
    }
  }, [view.pageItems, selectedRepo, view]);

  if (!repositories.data && !repositories.error) {
    return <LoadingPage />;
  }

  if (repositories.error) {
    return <HubError error={repositories.error} handleRefresh={repositories.refresh} />;
  }

  function renderRepoSelector() {
    return (
      <>
        <Radio
          isChecked={onlyStaging}
          name="radio-1"
          onChange={(_event, val) => {
            setOnlyStaging(val);
          }}
          label={t`Staging repos`}
          id="radio-staging"
        ></Radio>
        <Radio
          isChecked={!onlyStaging}
          name="radio-2"
          onChange={(_event, val) => {
            setOnlyStaging(!val);
          }}
          label={t`Repositories without pipeline`}
          id="radio-non-pipeline"
        ></Radio>
        <div>
          {!onlyStaging && (
            <>{t`Please note that those repositories are not filtered by permission, if operation fail, you don't have it.`}</>
          )}
        </div>

        <PageTable<Repository>
          id="hub-repositories-table"
          onSelect={(repo) => {
            setSelectedRepo({ name: repo.name, pulp_href: repo.pulp_href });
          }}
          disableListView={true}
          disableCardView={true}
          tableColumns={tableColumns}
          compact={true}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading repositories')}
          emptyStateTitle={t('No repositories yet')}
          emptyStateDescription={t('To get started, create an repository.')}
          defaultTableView="table"
          {...view}
        />
      </>
    );
  }

  async function submitData(data: UploadData) {
    setError('');
    const namespaceName = data.file?.name.split('-')[0] ?? '';
    if (namespaceParams && namespaceName !== namespaceParams) {
      setError(
        t(`Namespace "{{namespaceName}}" do not match namespace "{{namespaceParams}}."`, {
          namespaceName,
          namespaceParams,
        })
      );
      return;
    }

    let lastError = '';
    try {
      if (!data.file) {
        setError(t('Please select the file to be uploaded.'));
        return;
      }

      lastError = t('Error in loading namespace {{namespaceName}}.', { namespaceName });
      const namespace = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/namespaces/?limit=1&name=${namespaceName}`
      );
      if (namespace.data.length === 0) {
        setError(t('Can not find namespace {{namespaceName}}.', { namespaceName }));
        return;
      }

      lastError = t('Can not find distribution for selected repository.');

      const list = await distroGetRequest(
        pulpAPI`/distributions/ansible/ansible/?repository=${selectedRepo?.pulp_href || ''}`
      );
      const base_path = list?.results[0]?.base_path;

      if (!base_path) {
        setError(t('Can not find distribution for selected repository.'));
        return;
      }

      lastError = t(`Error occurred during collection upload.`);

      await hubPostRequestFile(
        hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
        data.file as Blob
      );

      if (onlyStaging) {
        pageNavigate(HubRoute.Approvals);
      } else {
        pageNavigate(HubRoute.Collections);
      }
    } catch (error) {
      setError(lastError + error?.toString());
    }
  }

  return (
    <HubPageForm<UploadData>
      submitText={t('Upload collection')}
      cancelText={t('Cancel')}
      onCancel={onCancel}
      onSubmit={(data) => {
        return submitData(data);
      }}
      disableSubmitOnEnter={true}
      singleColumn={true}
    >
      <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
      {error && <HubError error={{ name: '', message: error }}></HubError>}
      {renderRepoSelector()}
    </HubPageForm>
  );
}

export function useRepositoriesColumns() {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        sort: 'name',
        cell: (repository) => <TextCell text={repository.name} />,
      },
      {
        header: t('Description'),
        cell: (repository) => <TextCell text={repository.description} />,
      },
    ],
    [t]
  );
  return tableColumns;
}

export function useRepoFilters() {
  const { t } = useTranslation();
  return useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.SingleText,
        query: 'name__icontains',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
