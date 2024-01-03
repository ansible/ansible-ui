import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function CreatePlatformTeam() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    const createdTeam = await postRequest(gatewayAPI`/v1/teams/`, team);
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
  const { data: team, isLoading } = useGet<PlatformTeam>(gatewayAPI`/v1/teams/${id.toString()}/`);
  const patchRequest = usePatchRequest<PlatformTeam, PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    await patchRequest(gatewayAPI`/v1/teams/${id.toString()}/`, team);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
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
      <PageFormTextInput<PlatformTeam>
        name="organization"
        label={t('Organization')}
        placeholder={t('Enter organization')}
        isRequired
        helperText={t(
          'Enter the id of the organization until we have a dropdown with all the organizations.'
        )}
      />
    </>
  );
}
