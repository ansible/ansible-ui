import { Alert, Radio } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageDetails,
  PageForm,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ITableColumn,
} from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../framework/PageForm/Utils/PageFormWatch';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { postRequestFile } from '../../common/crud/Data';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { useRepositories } from '../repositories/hooks/useRepositories';
import { hubAPI } from '../api';

import { useState, useMemo } from 'react';

import { usePulpView } from '../usePulpView';
import { IToolbarFilter } from '../../../framework';
import { nameKeyFn } from '../api';

interface UploadData {
  file: unknown;
}

export interface Repository {
  name: string;
  description?: string;
  pulp_id: string;
  pulp_last_updated: string;
  content_count: number;
  gpgkey: string | null;
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

  // const navigate = useNavigate()
  const tableColumns = useRepositoriesColumns();
  const view = usePulpView<Repository>({
    url: '/api/automation-hub/pulp/api/v3/repositories/ansible/ansible/',
    keyFn: nameKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const [onlyStaging, setOnlyStaging] = useState(true);
  //const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
          label={t`All Repos`}
          id="radio-all"
        ></Radio>
        <div>
          {!onlyStaging && (
            <>{t`Please note that those repositories are not filtered by permission, if operation fail, you don't have it.`}</>
          )}
        </div>

        <PageTable<Repository>
          isSelectMultiple={false}
          showSelect={true}
          disableColumnManagement={true}
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
            return postRequestFile(
              hubAPI`/v3/plugin/ansible/content/staging/collections/artifacts/`,
              data.file as Blob
            ).then(() => navigate(RouteObj.Approvals + '?status=staging'));
          }}
          singleColumn={true}
        >
          <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
          {renderRepoSelector()}

          <PageFormWatch<File | undefined> watch="file">
            {(file) => {
              const namespace = file?.name.split('-')[0] ?? '';
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
        cell: (repository) => (
          <>
            <TextCell text={repository.name} />
          </>
        ),
      },
      {
        header: t('Description'),
        cell: (repository) => (
          <>
            <TextCell text={repository.description} />
          </>
        ),
      },
    ],
    []
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
        type: 'string',
        query: 'name',
        comparison: 'startsWith',
      },
    ],
    [t]
  );
}
