import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { RouteObj } from '../../../Routes';
import { Team } from '../../interfaces/Team';
import { PageFormOrganizationSelect } from '../organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../organizations/utils/getOrganizationByName';

export function CreateTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Omit<Team, 'id'>, Team>();
  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam) => {
    try {
      const organization = await getOrganizationByName(editedTeam.summary_fields.organization.name);
      if (!organization) throw new Error(t('Organization not found.'));
      editedTeam.organization = organization.id;
    } catch {
      throw new Error(t('Organization not found.'));
    }
    const team = await postRequest('/api/v2/teams/', editedTeam);
    navigate(RouteObj.TeamDetails.replace(':id', team.id.toString()));
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Create team') }]}
      />
      <PageForm submitText={t('Create team')} onSubmit={onSubmit} onCancel={() => navigate(-1)}>
        <TeamInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: team } = useGet<Team>(`/api/v2/teams/${id.toString()}/`);
  const patchRequest = usePatchRequest<Team, Team>();
  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam) => {
    try {
      const organization = await getOrganizationByName(editedTeam.summary_fields.organization.name);
      if (!organization) throw new Error(t('Organization not found.'));
      editedTeam.organization = organization.id;
    } catch {
      throw new Error(t('Organization not found.'));
    }
    await patchRequest(`/api/v2/teams/${id}/`, editedTeam);
    navigate(-1);
  };
  if (!team) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Edit team') }]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Edit team') }]}
      />
      <PageForm
        submitText={t('Save team')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={team}
      >
        <TeamInputs />
      </PageForm>
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
      <PageFormOrganizationSelect<Team> name="summary_fields.organization.name" />
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
