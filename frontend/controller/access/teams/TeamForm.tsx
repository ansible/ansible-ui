import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { Team } from '../../interfaces/Team';
import { getControllerError } from '../../useControllerView';
import { PageFormOrganizationSelect } from '../organizations/components/PageFormOrganizationSelect';

export function CreateTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam, setError) => {
    try {
      try {
        const organization = await getOrganizationByName(
          editedTeam.summary_fields.organization.name
        );
        if (!organization) throw new Error(t('Organization not found.'));
        editedTeam.organization = organization.id;
      } catch {
        throw new Error(t('Organization not found.'));
      }
      const team = await requestPost<Team>('/api/v2/teams/', editedTeam);
      navigate(RouteE.TeamDetails.replace(':id', team.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Create team') }]}
      />
      <PageForm submitText={t('Create team')} onSubmit={onSubmit} onCancel={() => navigate(-1)}>
        <TeamInputs />
      </PageForm>
    </PageLayout>
  );
}

async function getOrganizationByName(organizationName: string) {
  const itemsResponse = await requestGet<ItemsResponse<Organization>>(
    `/api/v2/organizations/?name=${organizationName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}

export function EditTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: team } = useSWR<Team>(`/api/v2/teams/${id.toString()}/`, requestGet, swrOptions);
  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam, setError) => {
    try {
      try {
        const organization = await getOrganizationByName(
          editedTeam.summary_fields.organization.name
        );
        if (!organization) throw new Error(t('Organization not found.'));
        editedTeam.organization = organization.id;
      } catch {
        throw new Error(t('Organization not found.'));
      }
      await requestPatch<Team>(`/api/v2/teams/${id}/`, editedTeam);
      navigate(-1);
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  if (!team) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]}
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
      <PageFormTextArea<Team>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormOrganizationSelect<Team> name="summary_fields.organization.name" />
    </>
  );
}
