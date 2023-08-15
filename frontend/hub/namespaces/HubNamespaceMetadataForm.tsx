import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { HubNamespaceMetadataType } from './HubNamespaceMetadataType';
import { hubAPI } from '../api';
import { ItemsResponse } from '../../common/crud/Data';

export function EditHubNamespaceMetadata() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { data: namespacesResponse } = useGet<ItemsResponse<HubNamespaceMetadataType>>(
    hubAPI`/v3/plugin/ansible/search/namespace-metadata/?name=${name ?? ''}`
  );
  const patchRequest = usePatchRequest<HubNamespaceMetadataType>();
  const onSubmit: PageFormSubmitHandler<HubNamespaceMetadataType> = async (namespace) => {
    await patchRequest(hubAPI`/v3/plugin/ansible/search/namespace-metadata/`, namespace);
    navigate(-1);
  };
  if (!namespacesResponse || namespacesResponse.results.length === 0) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Namespaces'), to: RouteObj.Namespaces },
            { label: t('Edit Namespace Details') },
            { label: params.id },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Namespace Details')}
        breadcrumbs={[
          { label: t('Namespaces'), to: RouteObj.Namespaces },
          { label: t('Edit Namespace Details') },
          { label: params.id },
        ]}
      />

      <PageForm<HubNamespaceMetadataType>
        submitText={t('Save namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={namespacesResponse.results[0]}
      >
        <HubNamespaceMetadataInputs />
      </PageForm>
    </PageLayout>
  );
}

function HubNamespaceMetadataInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<HubNamespaceMetadataType>
        name="metadata.name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        isReadOnly
      />
      <PageFormTextInput<HubNamespaceMetadataType>
        name="metadata.description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormTextInput<HubNamespaceMetadataType>
        name="metadata.company"
        label={t('Company')}
        placeholder={t('Enter company')}
      />
      <PageFormTextInput<HubNamespaceMetadataType>
        name="metadata.avatar_url"
        label={t('Logo')}
        placeholder={t('Enter logo url')}
      />
    </>
  );
}
