import { Alert, Radio } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetails, PageForm, PageHeader, PageLayout } from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../framework/PageForm/Utils/PageFormWatch';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { RouteObj } from '../../Routes';
import { postRequestFile } from '../../common/crud/Data';
import { useHubNamespaces } from '../namespaces/hooks/useHubNamespaces';
import { useRepositories } from '../repositories/hooks/useRepositories';
import { hubAPI } from '../api';
import { useState, useEffect } from 'react';
import { MultipleRepoSelector } from './MultipleRepoSelector';

interface UploadData {
  file: unknown;
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
  const [onlyStaging, setOnlyStaging] = useState(true);

  const [allRepos, setAllRepos] = useState([]);
  const [fixedRepos, setFixedRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);

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
        <MultipleRepoSelector />
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
