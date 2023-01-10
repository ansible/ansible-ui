import { Alert } from '@patternfly/react-core';
import { Static, Type } from '@sinclair/typebox';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageDetails, PageForm, PageHeader, PageLayout } from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { PageDetail } from '../../../../framework/PageDetails/PageDetail';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { requestPostFile } from '../../../Data';
import { RouteE } from '../../../Routes';
import { useRepositories } from '../../administration/repositories/hooks/useRepositories';
import { useNamespaces } from '../namespaces/hooks/useNamespaces';

const UploadSchema = Type.Object({ file: Type.Any() });
type UploadData = Static<typeof UploadSchema>;

export function UploadCollection() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Upload collection')}
        breadcrumbs={[
          { label: t('Collections'), to: RouteE.Collections },
          { label: t('Upload collection') },
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
          schema={UploadSchema}
          submitText={t('Confirm')}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          onSubmit={(data) => {
            const namespace = (data.file as File).name.split('-')[0];
            return requestPostFile(
              `/api/automation-hub/content/inbound-${namespace}/v3/artifacts/collections/`,
              data.file as Blob
            ).then(() => navigate(RouteE.Approvals + '?status=staging'));
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
