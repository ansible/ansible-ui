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
import { useInvalidateCacheOnUnmount } from '../../../../common/useInvalidateCache/useInvalidateCache';
import { edaAPI } from '../../../common/eda-utils';
import { EdaPageForm } from '../../../common/EdaPageForm';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { EdaResult } from '../../../interfaces/EdaResult';
import { EdaTeam, EdaTeamCreate, EdaTeamDetail } from '../../../interfaces/EdaTeam';
import { EdaRoute } from '../../../main/EdaRoutes';
import { PageFormSelectOrganization } from '../../organizations/components/PageFormOrganizationSelect';

export function CreateTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;
  const postRequest = usePostRequest<EdaTeamCreate, EdaTeam>();

  const onSubmit: PageFormSubmitHandler<EdaTeamCreate> = async (team) => {
    const newTeam = await postRequest(edaAPI`/teams/`, team);
    pageNavigate(EdaRoute.TeamDetails, { params: { id: newTeam.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(EdaRoute.Teams) },
          { label: t('Create team') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create team')}
        onSubmit={onSubmit}
        onCancel={onCancel}
        defaultValue={{ organization_id: defaultOrganization?.id }}
      >
        <TeamInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: team } = useSWR<EdaTeamDetail>(
    edaAPI`/teams/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<EdaTeam> = async (team) => {
    const newTeam = await requestPatch<EdaTeam>(edaAPI`/teams/${id.toString()}/`, team);
    pageNavigate(EdaRoute.TeamDetails, { params: { id: newTeam.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={team?.name ? `${t('Edit')} ${team?.name}` : t('Team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(EdaRoute.Teams) },
          { label: team?.name ? `${t('Edit')} ${team?.name}` : t('Team') },
        ]}
      />
      {team ? (
        <EdaPageForm
          submitText={t('Save team')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={{
            ...team,
            organization_id: team?.organization?.id || undefined,
          }}
        >
          <TeamInputs />
        </EdaPageForm>
      ) : null}
    </PageLayout>
  );
}

function TeamInputs() {
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput label={t('Name')} name="name" placeholder={t('Enter name')} isRequired />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<EdaTeam> name="organization_id" />
    </>
  );
}
