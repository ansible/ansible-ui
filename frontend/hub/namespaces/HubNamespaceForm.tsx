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
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubNamespace } from './HubNamespace';
import { pulpAPI } from '../api/utils';
import { ItemsResponse } from '../../common/crud/Data';

export function CreateHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    const createdNamespace = await postRequest(pulpAPI`/pulp_ansible/namespaces/`, namespace);
    navigate(RouteObj.NamespaceDetails.replace(':id', createdNamespace.name.toString()));
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Namespace')}
        breadcrumbs={[
          { label: t('Namespaces'), to: RouteObj.Namespaces },
          { label: t('Create Namespace') },
        ]}
      />
      <PageForm<HubNamespace>
        submitText={t('Create namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{
          latest_metadata: { groups: [] },
        }}
      >
        <HubNamespaceInputs isReadOnly={false} />
      </PageForm>
    </PageLayout>
  );
}

export function EditHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const name = params.id;
  const { data: namespacesResponse } = useGet<ItemsResponse<HubNamespace>>(
    pulpAPI`/pulp_ansible/namespaces/?name=${name ?? ''}`
  );
  const patchRequest = usePatchRequest<HubNamespace, HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    await patchRequest(pulpAPI`/pulp_ansible/namespaces/`, namespace);
    navigate(-1);
  };
  if (!namespacesResponse || namespacesResponse.results.length === 0) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Namespaces'), to: RouteObj.Namespaces },
            { label: t('Edit Namespace') },
            { label: params.id },
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
          { label: t('Namespaces'), to: RouteObj.Namespaces },
          { label: t('Edit Namespace') },
          { label: params.id },
        ]}
      />

      <PageForm<HubNamespace>
        submitText={t('Save namespace')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={namespacesResponse.results[0]}
      >
        <HubNamespaceInputs isReadOnly={true} />
      </PageForm>
    </PageLayout>
  );
}

function HubNamespaceInputs(props: { isReadOnly?: boolean }) {
  const { t } = useTranslation();
  const { isReadOnly } = props;
  return (
    <>
      <PageFormTextInput<HubNamespace>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        isReadOnly={isReadOnly}
      />
      <PageFormTextInput<HubNamespace>
        name="latest_metadata.description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormTextInput<HubNamespace>
        name="latest_metadata.company"
        label={t('Company')}
        placeholder={t('Enter company')}
      />
      <PageFormTextInput<HubNamespace>
        name="latest_metadata.avatar_url"
        label={t('Logo URL')}
        placeholder={t('Enter logo URL')}
      />
    </>
  );
}
