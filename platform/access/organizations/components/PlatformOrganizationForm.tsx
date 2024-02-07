import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function CreatePlatformOrganization() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformOrganization>();
  const onSubmit: PageFormSubmitHandler<PlatformOrganization> = async (organization) => {
    const createdOrganization = await postRequest(gatewayV1API`/organizations/`, organization);
    pageNavigate(PlatformRoute.OrganizationDetails, { params: { id: createdOrganization.id } });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          { label: t('Create organization') },
        ]}
      />
      <PageForm
        submitText={t('Create organization')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
      >
        <PlatformOrganizationInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditPlatformOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const {
    data: organization,
    isLoading,
    error,
  } = useGet<PlatformOrganization>(gatewayV1API`/organizations/${id.toString()}/`);
  const patchRequest = usePatchRequest<PlatformOrganization, PlatformOrganization>();
  const onSubmit: PageFormSubmitHandler<PlatformOrganization> = async (organization) => {
    await patchRequest(gatewayV1API`/organizations/${id.toString()}/`, organization);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!organization) return <PageNotFound />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          { label: t('Edit organization') },
        ]}
      />
      <PageForm
        submitText={t('Save organization')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={organization}
      >
        <PlatformOrganizationInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformOrganizationInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<PlatformOrganization>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<PlatformOrganization>
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
    </>
  );
}
