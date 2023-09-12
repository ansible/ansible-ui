import { Stack, Text, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageWizard, PageWizardStep } from '../../../../framework/PageWizard/PageWizard';
import { RouteObj } from '../../../common/Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { Team } from '../../interfaces/Team';
import { PageFormSelectOrganization } from '../organizations/components/PageFormOrganizationSelect';
import { TeamDetails } from './TeamPage/TeamDetails';

export function CreateTeamWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Team>();
  const onSubmit = async (team: Team) => {
    team.organization = team.summary_fields?.organization?.id;
    const createdTeam = await postRequest('/api/v2/teams/', team);
    navigate(RouteObj.TeamDetails.replace(':id', createdTeam.id.toString()));
  };
  const steps: PageWizardStep[] = [
    {
      id: 'welcome',
      label: 'Welcome',
      element: (
        <Stack hasGutter>
          <Title headingLevel="h1">Welcome to the create team wizard</Title>
          <Text>This wizard will walk you through the steps to create a team.</Text>
          <Text>Click next to continue.</Text>
        </Stack>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      inputs: (
        <>
          <PageFormTextInput<Team>
            name="name"
            label={t('Name')}
            placeholder={t('Enter name')}
            isRequired
          />
          <PageFormSection singleColumn>
            <PageFormTextArea<Team>
              name="description"
              label={t('Description')}
              placeholder={t('Enter description')}
            />
          </PageFormSection>
        </>
      ),
    },
    {
      id: 'organization',
      label: 'Organization',
      inputs: <PageFormSelectOrganization<Team> name="summary_fields.organization" isRequired />,
    },
    {
      id: 'review',
      label: 'Review',
      element: (
        <Stack hasGutter>
          <Title headingLevel="h1">Review</Title>
          <TeamDetails team={{ name: 'Name' }} disablePadding />
        </Stack>
      ),
    },
  ];
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Create Team') }]}
      />
      <PageWizard steps={steps} onSubmit={onSubmit} />
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
  const onSubmit: PageFormSubmitHandler<Team> = async (team) => {
    team.organization = team.summary_fields?.organization?.id;
    await patchRequest(`/api/v2/teams/${id}/`, team);
    navigate(-1);
  };
  if (!team) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Edit Team') }]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteObj.Teams }, { label: t('Edit Team') }]}
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
      <PageFormSelectOrganization<Team> name="summary_fields.organization" isRequired />
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
