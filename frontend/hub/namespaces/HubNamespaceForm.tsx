import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubRoute } from '../HubRoutes';
import { hubAPI } from '../api/formatPath';
import { HubNamespace } from './HubNamespace';
import { HubPageForm } from '../HubPageForm';
import { HubError } from '../common/HubError';

export function CreateHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    const createdNamespace = await postRequest(hubAPI`/_ui/v1/namespaces/`, namespace);
    pageNavigate(HubRoute.NamespacePage, { params: { id: createdNamespace.name } });
  };
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Namespace')}
        breadcrumbs={[
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          { label: t('Create Namespace') },
        ]}
      />
      <HubPageForm<HubNamespace>
        submitText={t('Create namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{ groups: [] }}
      >
        <HubNamespaceInputs />
      </HubPageForm>
    </PageLayout>
  );
}

export function EditHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const {
    data: namespace,
    error,
    refresh,
  } = useGet<HubNamespace>(hubAPI`/_ui/v1/namespaces/${name ?? ''}/`);
  const patchRequest = usePatchRequest<HubNamespace, HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    await patchRequest(hubAPI`/_ui/v1/namespaces/`, namespace);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();

  if (error) {
    return <HubError error={error} handleRefresh={refresh}></HubError>;
  }

  if (!namespace && !error) {
    return <LoadingPage></LoadingPage>;
  }

  if (!namespace) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
            { label: t('Edit Namespace') },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Namespace')}
        breadcrumbs={[
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          { label: t('Edit Namespace') },
        ]}
      />

      <HubPageForm<HubNamespace>
        submitText={t('Save namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={namespace}
      >
        <HubNamespaceInputs />
      </HubPageForm>
    </PageLayout>
  );
}

function HubNamespaceInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<HubNamespace>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<HubNamespace>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormTextInput<HubNamespace>
        name="company"
        label={t('Company')}
        placeholder={t('Enter company')}
      />
      <PageFormTextInput<HubNamespace>
        name="avatar_url"
        label={t('Logo URL')}
        placeholder={t('Enter logo URL')}
      />
    </>
  );
}
