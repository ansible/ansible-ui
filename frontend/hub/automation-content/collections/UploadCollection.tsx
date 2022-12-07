import { Static, Type } from '@sinclair/typebox';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageBody,
  PageForm,
  PageFormSelectOption,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { requestPostFile } from '../../../Data';
import { RouteE } from '../../../Routes';
import { useRepositories } from '../../administration/repositories/hooks/useRepositories';
import { useNamespaces } from '../namespaces/hooks/useNamespaces';

const UploadSchema = Type.Object({
  namespace: Type.String(),
  file: Type.Any(),
});
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
        <PageBody>
          <PageForm<UploadData>
            schema={UploadSchema}
            submitText={t('Confirm')}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            onSubmit={(data) =>
              requestPostFile(
                '/api/automation-hub/content/inbound-ansible/v3/artifacts/collections/',
                data.file as Blob
              )
            }
          >
            <PageFormSelectOption
              label={t('Namespace')}
              name="namespace"
              isRequired
              options={namespaces.map((namespace) => ({
                label: namespace.name,
                description: namespace.description,
                value: namespace.name,
              }))}
              placeholderText="Select namespace"
            />
            <PageFormFileUpload label={t('Collection file')} name="file" isRequired />
          </PageForm>
        </PageBody>
      )}
    </>
  );
}
