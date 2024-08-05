import { Radio } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { ToolbarFilterType } from '../../../framework/PageToolbar/PageToolbarFilter';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { useURLSearchParams } from '../../../framework/components/useURLSearchParams';
import { requestGet } from '../../common/crud/Data';
import { useGetRequest } from '../../common/crud/useGet';
import { nameKeyFn } from '../../common/utils/nameKeyFn';
import { useRepositories } from '../administration/repositories/hooks/useRepositories';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
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
      <UploadCollectionByFile />
    </PageLayout>
  );
}

export function UploadCollectionByFile() {
  const { t } = useTranslation();

  const [searchParams] = useURLSearchParams();
  const namespaceParams = searchParams.get('namespace');
  const repositories = useRepositories();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const onCancel = () => navigate(-1);
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

  function getNamespaceNameFromFile(file?: File) {
    return file?.name.split('-')[0] ?? '';
  }

  async function submitData(data: UploadData) {
    setError('');
    const namespaceName = getNamespaceNameFromFile(data.file);
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
        lastError = t('Please select the file to be uploaded.');
        throw new Error('');
      }

      lastError = t('Error in loading namespace {{namespaceName}}.', { namespaceName });
      const namespace = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/namespaces/?limit=1&name=${namespaceName}`
      );
      if (namespace.data.length === 0) {
        lastError = t('Can not find namespace {{namespaceName}}.', { namespaceName });
        throw new Error('');
      }

      lastError = t('Can not find distribution for selected repository.');

      const list = await distroGetRequest(
        pulpAPI`/distributions/ansible/ansible/?repository=${selectedRepo?.pulp_href || ''}`
      );
      const base_path = list?.results[0]?.base_path;

      if (!base_path) {
        throw new Error('');
      }

      lastError = t(`Error occured during collection upload.`);

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
    <>
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
    </>
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
