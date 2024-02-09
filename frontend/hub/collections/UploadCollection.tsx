import { Alert, Radio } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ITableColumn,
  IToolbarFilter,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../framework/PageForm/Utils/PageFormWatch';
import { ToolbarFilterType } from '../../../framework/PageToolbar/PageToolbarFilter';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { useSearchParams } from '../../../framework/components/useSearchParams';
import { useGetRequest } from '../../common/crud/useGet';
import { nameKeyFn } from '../../common/utils/nameKeyFn';
import { useRepositories } from '../administration/repositories/hooks/useRepositories';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI, pulpAPI } from '../common/api/formatPath';
import { hubPostRequestFile } from '../common/api/request';
import { PulpItemsResponse, useHubView } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';

interface UploadData {
  file: unknown;
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
  // TODO - we dont definetly want load all namespaces and repositories
  // this will be addressed in future PR - load particular repo and namespace when we know the name after file selection
  // so no need to handle errors in useGet inside those hooks
  const namespaces = useHubNamespaces();
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
  const [namespaceParams, setNamespaceParams] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const ns = searchParams.get('namespace');
  if (ns && namespaceParams !== ns) {
    setNamespaceParams(ns);
  }

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
          label={t`Staging Repos`}
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
    const list = await distroGetRequest(
      pulpAPI`/distributions/ansible/ansible/?repository=${selectedRepo?.pulp_href}`
    );
    const base_path = list?.results[0]?.base_path;

    return hubPostRequestFile(
      hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
      data.file as Blob
    ).then(() => pageNavigate(HubRoute.Approvals));
  }

  return (
    <>
      {namespaces?.data?.data === undefined || repositories?.data?.data === undefined ? (
        <LoadingPage />
      ) : (
        <HubPageForm<UploadData>
          submitText={t('Confirm')}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          onSubmit={(data) => {
            return submitData(data);
          }}
          singleColumn={true}
        >
          <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
          {renderRepoSelector()}

          <PageFormWatch<File | undefined> watch="file">
            {(file) => {
              const namespace = file?.name.split('-')[0] ?? '';
              if (namespaceParams) {
                if (namespaceParams !== namespace) {
                  return (
                    <Alert
                      variant="danger"
                      isInline
                      title={t(
                        `Namespace "${namespace}" do not match namespace "${namespaceParams}"`
                      )}
                    >
                      {t(
                        `The collection cannot be imported. Please select collection that belongs to namespace "${namespaceParams}".`
                      )}
                    </Alert>
                  );
                }
              }
              return (
                <>
                  {
                    /* TODO - we have to load namespace by name, not all of them */
                    namespace && !namespaces.data?.data.find((ns) => ns.name === namespace) && (
                      <Alert
                        variant="danger"
                        isInline
                        title={t(`Namespace "${namespace}" not found`)}
                      >
                        {t(
                          'The collection cannot be imported. Please create namespace before importing.'
                        )}
                      </Alert>
                    )
                  }
                  {namespace && (
                    <PageDetails>
                      <PageDetail label={t('Namespace')}>{namespace}</PageDetail>
                    </PageDetails>
                  )}
                </>
              );
            }}
          </PageFormWatch>
        </HubPageForm>
      )}
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
