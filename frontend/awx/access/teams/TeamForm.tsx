import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl, usePageNavigate } from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { Team } from '../../interfaces/Team';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';

export function CreateTeam() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Team>();
  const onSubmit: PageFormSubmitHandler<Team> = async (team) => {
    const createdTeam = await postRequest(awxAPI`/teams/`, team);
    pageNavigate(AwxRoute.TeamDetails, { params: { id: createdTeam.id } });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(AwxRoute.Teams) },
          { label: t('Create team') },
        ]}
      />
      <AwxPageForm submitText={t('Create team')} onSubmit={onSubmit} onCancel={() => navigate(-1)}>
        <TeamInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: team } = useGet<Team>(awxAPI`/teams/${id.toString()}/`);
  const patchRequest = usePatchRequest<Team, Team>();
  const onSubmit: PageFormSubmitHandler<Team> = async (team) => {
    await patchRequest(awxAPI`/teams/${id.toString()}/`, team);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (!team) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Teams'), to: getPageUrl(AwxRoute.Teams) },
            { label: t('Edit Team') },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={team?.name ? t('Edit {{teamName}}', { teamName: team?.name }) : t('Team')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(AwxRoute.Teams) },
          { label: team?.name ? t('Edit {{teamName}}', { teamName: team?.name }) : t('Team') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save team')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={team}
      >
        <TeamInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

function TeamInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<Team>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormSelectOrganization<Team> name="organization" isRequired />
      <PageFormSection singleColumn>
        <PageFormTextArea<Team>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
        />
      </PageFormSection>
    </>
  );
}
