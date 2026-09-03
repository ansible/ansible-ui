import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  PageNotFound,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PageFormPlatformOrganizationSelect } from '../../organizations/components/PageFormPlatformOrganizationSelect';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';

export function CreatePlatformTeam() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformTeam>();
  const { data: optionsData } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/teams/`);

  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    const createdTeam = await postRequest(gatewayAPI`/teams/`, team);
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
        onCancel={() => void navigate(-1)}
        optionsData={optionsData}
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
  } = useGet<PlatformTeam>(gatewayAPI`/teams/${id.toString()}/`);
  const { data: optionsData } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/teams/`);
  const patchRequest = usePatchRequest<PlatformTeam, PlatformTeam>();
  const onSubmit: PageFormSubmitHandler<PlatformTeam> = async (team) => {
    await patchRequest(gatewayAPI`/teams/${id.toString()}/`, team);
    void navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
  if (error) return <AwxError error={error} />;
  if (!team) return <PageNotFound />;
  return (
    <PageLayout>
      <PageHeader
        title={team?.name ? t('Edit {{teamName}}', { teamName: team?.name }) : t('Teams')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          { label: team?.name ? t('Edit {{teamName}}', { teamName: team?.name }) : t('Teams') },
        ]}
      />
      <PageForm
        submitText={t('Save team')}
        onSubmit={onSubmit}
        onCancel={() => void navigate(-1)}
        defaultValue={team}
        optionsData={optionsData}
      >
        <PlatformTeamInputs isEditMode />
      </PageForm>
    </PageLayout>
  );
}

function PlatformTeamInputs(props: Readonly<{ isEditMode?: boolean }>) {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const { isEditMode } = props;
  return (
    <>
      <PageFormTextInput<PlatformTeam>
        name="name"
        label={t('Name')}
        placeholder={t('Enter team name')}
        isRequired
      />
      <PageFormTextArea
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormPlatformOrganizationSelect
        name="organization"
        isRequired
        isDisabled={
          !isEditMode || activePlatformUser?.is_superuser
            ? undefined
            : t(
                'You do not have permission to edit the organization. Please contact your system administrator if there is an issue with your access.'
              )
        }
      />
    </>
  );
}
