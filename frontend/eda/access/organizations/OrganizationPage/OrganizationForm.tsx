import {
  PageFormSubmitHandler,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch } from '@ansible/common-ui/crud/Data';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { edaAPI } from '../../../common/eda-utils';
import { EdaPageForm } from '../../../common/EdaPageForm';
import { EdaOrganization, EdaOrganizationCreate } from '../../../interfaces/EdaOrganization';
import { EdaRoute } from '../../../main/EdaRoutes';

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<EdaOrganizationCreate, EdaOrganization>();

  const onSubmit: PageFormSubmitHandler<EdaOrganizationCreate> = async (organization) => {
    const newOrganization = await postRequest(edaAPI`/organizations/`, organization);
    pageNavigate(EdaRoute.OrganizationDetails, { params: { id: newOrganization.id } });
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(EdaRoute.Organizations) },
          { label: t('Create organization') },
        ]}
      />
      <EdaPageForm submitText={t('Create organization')} onSubmit={onSubmit} onCancel={onCancel}>
        <OrganizationInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: organization } = useSWR<EdaOrganization>(
    edaAPI`/organizations/${id.toString()}/`,
    requestGet
  );

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<EdaOrganization> = async (organization) => {
    const newOrganization = await requestPatch<EdaOrganization>(
      edaAPI`/organizations/${id.toString()}/`,
      organization
    );
    pageNavigate(EdaRoute.OrganizationDetails, { params: { id: newOrganization.id } });
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={organization?.name ? `${t('Edit')} ${organization?.name}` : t('Organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(EdaRoute.Organizations) },
          { label: organization?.name ? `${t('Edit')} ${organization?.name}` : t('Organization') },
        ]}
      />
      {organization ? (
        <EdaPageForm
          submitText={t('Save organization')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={organization}
        >
          <OrganizationInputs />
        </EdaPageForm>
      ) : null}
    </PageLayout>
  );
}

function OrganizationInputs() {
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput label={t('Name')} name="name" placeholder={t('Enter name')} isRequired />
      <PageFormTextArea
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
    </>
  );
}
