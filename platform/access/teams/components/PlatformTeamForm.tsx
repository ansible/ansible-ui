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
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PageFormPlatformOrganizationSelect } from '../../organizations/components/PageFormPlatformOrganizationSelect';
import { PageFormPlatformUsersSelect } from '../../users/components/PageFormPlatformUsersSelect';

export function CreatePlatformTeam() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    const createdTeam = await postRequest(gatewayV1API`/teams/`, team);
    pageNavigate(PlatformRoute.TeamDetails, { params: { id: createdTeam.id } });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: t('Create team') },
        ]}
      />
      <PageForm
        submitText={t('Create team')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
      >
        <PlatformTeamInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditPlatformTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const {
    data: team,
    isLoading,
    error,
  } = useGet<PlatformTeam>(gatewayV1API`/teams/${id.toString()}/`);
  const patchRequest = usePatchRequest<PlatformTeam, PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    await patchRequest(gatewayV1API`/teams/${id.toString()}/`, team);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!team) return <PageNotFound />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: t('Edit team') },
        ]}
      />
      <PageForm
        submitText={t('Save team')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={team}
      >
        <PlatformTeamInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformTeamInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<PlatformTeam>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormPlatformOrganizationSelect name="organization" isRequired />
      <PageFormSection singleColumn>
        <PageFormPlatformUsersSelect name="users" />
      </PageFormSection>
    </>
  );
}
