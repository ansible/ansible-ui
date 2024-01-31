import { Card, Radio } from '@patternfly/react-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { useSearchParams } from '../../../framework/components/useSearchParams';
import { requestGet } from '../../common/crud/Data';
import { RequestError } from '../../common/crud/RequestError';
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
  const toolbarFilters = useRepoFilters();
  const tableColumns = useRepositoriesColumns();
  const [onlyStaging, setOnlyStaging] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<{ name: string; pulp_href: string } | null>(
    null
  );
  const distroGetRequest = useGetRequest<PulpItemsResponse<Distribution>>();

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

  const onSubmit = useCallback(
    async (data: UploadData) => {
      const namespaceName = data.file?.name.split('-')[0] ?? '';
      if (namespaceParams && namespaceName !== namespaceParams) {
        throw new Error(
          t(`Namespace "{{namespaceName}}" does not match namespace "{{namespaceParams}}"`, {
            namespaceName,
            namespaceParams,
          })
        );
      }

      const namespace = await requestGet<HubItemsResponse<HubNamespace>>(
        hubAPI`/_ui/v1/namespaces/?limit=1&name=${namespaceName}`
      ).catch(() => {
        throw new Error(t('Error in loading namespace {{namespaceName}}', { namespaceName }));
      });

      if (namespace.data.length === 0) {
        throw new RequestError({
          message: t('Cannot find namespace {{namespaceName}}', { namespaceName }),
          statusCode: 404,
          json: { file: t('Cannot find namespace {{namespaceName}}', { namespaceName }) },
        });
      }

      const list = await distroGetRequest(
        pulpAPI`/distributions/ansible/ansible/?repository=${selectedRepo?.pulp_href || ''}`
      ).catch(() => {
        throw new Error(t('Cannot find distribution for selected repository'));
      });

      if (list?.results.length === 0) {
        throw new Error(t('Cannot find distribution for selected repository'));
      }

      const base_path = list?.results[0]?.base_path;

      await hubPostRequestFile(
        hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
        data.file as Blob
      ).catch(() => {
        throw new Error(t('Error occured during collection upload'));
      });

      pageNavigate(HubRoute.Approvals);
    },
    [distroGetRequest, namespaceParams, pageNavigate, selectedRepo?.pulp_href, t]
  );

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
          name="radio"
          onChange={(_event, val) => {
            setOnlyStaging(val);
          }}
          label={t`Staging Repos`}
          id="radio-staging"
        />
        <Radio
          isChecked={!onlyStaging}
          name="radio"
          onChange={(_event, val) => {
            setOnlyStaging(!val);
          }}
          label={t`Repositories without pipeline`}
          id="radio-non-pipeline"
        />
        <div>
          {!onlyStaging && (
            <>{t`Please note that those repositories are not filtered by permission, if operation fail, you don't have it.`}</>
          )}
        </div>

        <Card isFlat isRounded>
          <PageTable<Repository>
            id="hub-repositories-table"
            onSelect={(repo) => {
              setSelectedRepo({ name: repo.name, pulp_href: repo.pulp_href });
            }}
            disableListView={true}
            disableCardView={true}
            tableColumns={tableColumns}
            toolbarFilters={toolbarFilters}
            errorStateTitle={t('Error loading repositories')}
            emptyStateTitle={t('No repositories yet')}
            emptyStateDescription={t('To get started, create an repository.')}
            defaultTableView="table"
            {...view}
          />
        </Card>
      </>
    );
  }

  return (
    <HubPageForm<UploadData>
      submitText={t('Confirm')}
      cancelText={t('Cancel')}
      onCancel={onCancel}
      onSubmit={onSubmit}
      singleColumn={true}
    >
      <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
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
        type: ToolbarFilterType.Text,
        query: 'name__icontains',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
