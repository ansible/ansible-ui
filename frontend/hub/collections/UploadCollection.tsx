import { Alert, Radio } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ITableColumn,
  PageDetails,
  PageForm,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
} from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../framework/PageForm/Utils/PageFormWatch';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { postRequestFile } from '../../common/crud/Data';
import { useGetRequest } from '../../common/crud/useGetRequest';
import { hubAPI, pulpAPI, nameKeyFn } from '../api/utils';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { useRepositories } from '../repositories/hooks/useRepositories';
import { PulpItemsResponse } from '../usePulpView';

import { useEffect, useMemo, useState } from 'react';

import { IToolbarFilter } from '../../../framework';
import { ToolbarFilterType } from '../../../framework/PageToolbar/PageToolbarFilter';
import { useSearchParams } from '../../../framework/components/useSearchParams';
import { usePulpView } from '../usePulpView';

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
  return (
    <PageLayout>
      <PageHeader
        title={t('Upload Collection')}
        breadcrumbs={[
          { label: t('Collections'), to: RouteObj.Collections },
          { label: t('Upload Collection') },
        ]}
      />
      <UploadCollectionByFile />
    </PageLayout>
  );
}

export function UploadCollectionByFile() {
  const { t } = useTranslation();
  const namespaces = useHubNamespaces();
  const repositories = useRepositories();
  const navigate = useNavigate();
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
  if (ns && namespaceParams != ns) {
    setNamespaceParams(ns);
  }

  const view = usePulpView<Repository>({
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

    const item = view.pageItems?.find((item) => item.name == 'staging');
    if (item) {
      setSelectedRepo({ name: 'staging', pulp_href: item.pulp_href });
      view.selectItem(item);
    }
  }, [view.pageItems, selectedRepo, view]);

  function renderRepoSelector() {
    return (
      <>
        <Radio
          isChecked={onlyStaging}
          name="radio-1"
          onChange={(val) => {
            setOnlyStaging(val);
          }}
          label={t`Staging Repos`}
          id="radio-staging"
        ></Radio>
        <Radio
          isChecked={!onlyStaging}
          name="radio-2"
          onChange={(val) => {
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
      pulpAPI`/distributions/ansible/ansible/?repository=${selectedRepo?.pulp_href || ''}`
    );
    const base_path = list?.results[0]?.base_path;

    return postRequestFile(
      hubAPI`/v3/plugin/ansible/content/${base_path}/collections/artifacts/`,
      data.file as Blob
    ).then(() => navigate(RouteObj.Approvals));
  }

  return (
    <>
      {namespaces === undefined || repositories === undefined ? (
        <LoadingPage />
      ) : (
        <PageForm<UploadData>
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
                if (namespaceParams != namespace) {
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
                  {namespace && !namespaces.find((ns) => ns.name === namespace) && (
                    <Alert
                      variant="danger"
                      isInline
                      title={t(`Namespace "${namespace}" not found`)}
                    >
                      {t(
                        'The collection cannot be imported. Please create namespace before importing.'
                      )}
                    </Alert>
                  )}
                  {namespace && (
                    <PageDetails>
                      <PageDetail label={t('Namespace')}>{namespace}</PageDetail>
                    </PageDetails>
                  )}
                </>
              );
            }}
          </PageFormWatch>
        </PageForm>
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
        type: ToolbarFilterType.Text,
        query: 'name__icontains',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
