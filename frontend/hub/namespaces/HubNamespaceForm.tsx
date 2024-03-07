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
import { PageFormMarkdown } from '../../../framework/PageForm/Inputs/PageFormMarkdown';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { usePutRequest } from '../../common/crud/usePutRequest';
import { useClearCache } from '../../common/useInvalidateCache';
import { HubError } from '../common/HubError';
import { HubPageForm } from '../common/HubPageForm';
import { hubAPI } from '../common/api/formatPath';
import { HubRoute } from '../main/HubRoutes';
import { HubNamespace } from './HubNamespace';
import { UsefulLinksFields } from './UsefulLinksFields';

export function CreateHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace: HubNamespace) => {
    if (namespace?.links?.length === 1) {
      if (namespace.links[0].name === '' && namespace.links[0].url === '') {
        namespace.links = [];
      }
    }

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
        defaultValue={{ groups: [], links: [{ name: '', url: '' }] }}
      >
        <HubNamespaceInputs isDisabled={false} isRequired={true} />
        <UsefulLinksFields />
      </HubPageForm>
    </PageLayout>
  );
}

export function EditHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clearCacheByKey } = useClearCache();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const {
    data: namespace,
    error,
    refresh,
  } = useGet<HubNamespace>(hubAPI`/_ui/v1/my-namespaces/${name}/`);
  const putRequest = usePutRequest<HubNamespace, HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    if (namespace?.links?.length === 1) {
      if (namespace.links[0].name === '' && namespace.links[0].url === '') {
        namespace.links = [];
      }
    }

    await putRequest(hubAPI`/_ui/v1/my-namespaces/${name}/`, namespace);
    clearCacheByKey(hubAPI`/_ui/v1/my-namespaces/${name}/`);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();

  if (error) {
    return <HubError error={error} handleRefresh={refresh}></HubError>;
  }

  if (!namespace && !error) {
    return <LoadingPage />;
  }

  if (!namespace) {
    return (
      <PageLayout>
        <PageHeader
          title={t('Edit Namespace')}
          breadcrumbs={[
            { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
            { label: name, to: getPageUrl(HubRoute.NamespacePage, { params: { id: name } }) },
            { label: t('Edit Namespace') },
          ]}
        />
      </PageLayout>
    );
  }

  if (namespace.links.length === 0) {
    namespace.links = [{ name: '', url: '' }];
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Namespace')}
        breadcrumbs={[
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          { label: name, to: getPageUrl(HubRoute.NamespacePage, { params: { id: name } }) },
          { label: t('Edit Namespace') },
        ]}
      />

      <HubPageForm<HubNamespace>
        submitText={t('Save namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={namespace}
      >
        <HubNamespaceInputs isDisabled={true} />
        <UsefulLinksFields />
      </HubPageForm>
    </PageLayout>
  );
}

function HubNamespaceInputs(props: { isDisabled?: boolean; isRequired?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<HubNamespace>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isDisabled={props.isDisabled}
        isRequired={props.isRequired}
        helperText={props.isDisabled ? t('Name is not editable.') : undefined}
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
      <PageFormSection singleColumn>
        <PageFormMarkdown<HubNamespace>
          label={t('Resources')}
          name="resources"
          labelHelpTitle={t('Resources')}
          labelHelp={t(
            'You can can customize the Resources on your profile by entering custom markdown here.'
          )}
        />
      </PageFormSection>
    </>
  );
}
