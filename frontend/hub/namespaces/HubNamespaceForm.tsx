import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { RouteObj } from '../../Routes';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { HubNamespace } from './HubNamespace';

export function CreateHubNamespace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<HubNamespace>();
  const onSubmit: PageFormSubmitHandler<HubNamespace> = async (namespace) => {
    const createdNamespace = await postRequest('/api/automation-hub/_ui/v1/namespaces/', namespace);
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
        defaultValue={{ groups: [] }}
      >
        <HubNamespaceInputs />
      </PageForm>
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
