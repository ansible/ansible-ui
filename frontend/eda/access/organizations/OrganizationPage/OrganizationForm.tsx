import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, swrOptions } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../../common/useInvalidateCache';
import { EdaPageForm } from '../../../common/EdaPageForm';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { EdaRoute } from '../../../main/EdaRoutes';
import { edaAPI } from '../../../common/eda-utils';

interface OrganizationFields extends FieldValues {
  organization: EdaOrganization;
  id: number;
}

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<{ id: number }, EdaOrganization>();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values) => {
    const organization = await postRequest(edaAPI`/organizations/`, values.organization);
    pageNavigate(EdaRoute.OrganizationDetails, { params: { id: organization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(EdaRoute.Organizations) },
          { label: t('Create Organization') },
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
    requestGet,
    swrOptions
  );

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values) => {
    const organization = await requestPatch<EdaOrganization>(
      edaAPI`/organizations/${id.toString()}/`,
      values.organization
    );
    pageNavigate(EdaRoute.OrganizationDetails, { params: { id: organization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(EdaRoute.Organizations) },
          { label: t('Edit Organization') },
        ]}
      />
      {organization ? (
        <EdaPageForm
          submitText={t('Save organization')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={{ organization }}
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
      <PageFormTextInput
        label={t('Name')}
        name="organization.name"
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput
        label={t('Description')}
        name="organization.description"
        placeholder={t('Enter description')}
      />
    </>
  );
}
