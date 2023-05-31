import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetails, PageForm, PageHeader, PageLayout } from '../../../../framework';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../Routes';
import { postRequestFile } from '../../../common/crud/Data';
import { useRepositories } from '../../administration/repositories/hooks/useRepositories';
import { useNamespaces } from '../namespaces/hooks/useNamespaces';

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
  const namespaces = useNamespaces();
  const repositories = useRepositories();
  const navigate = useNavigate();
  const onCancel = () => navigate(-1);
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
            const namespace = (data.file as File).name.split('-')[0];
            return postRequestFile(
              `/api/automation-hub/content/inbound-${namespace}/v3/artifacts/collections/`,
              data.file as Blob
            ).then(() => navigate(RouteObj.Approvals + '?status=staging'));
          }}
        >
          <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
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
