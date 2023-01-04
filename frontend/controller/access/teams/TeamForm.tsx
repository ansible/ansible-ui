import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { PageBody, PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextArea } from '../../../../framework/PageForm/Inputs/PageFormTextArea';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { ItemsResponse, requestGet, requestPatch, requestPost, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Organization } from '../../interfaces/Organization';
import { Team } from '../../interfaces/Team';
import { getControllerError } from '../../useControllerView';
import { useSelectOrganization } from '../organizations/hooks/useSelectOrganization';

export function CreateTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam, setError) => {
    try {
      const team = await requestPost<Team>('/api/v2/teams/', editedTeam);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteE.TeamDetails.replace(':id', team.id.toString()));
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create team')}
        breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Create team') }]}
      />
      <PageBody>
        <PageForm submitText={t('Create team')} onSubmit={onSubmit} onCancel={onCancel}>
          <TeamInputs />
        </PageForm>
      </PageBody>
    </PageLayout>
  );
}

export function EditTeam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: team } = useSWR<Team>(
    Number.isInteger(id) ? `/api/v2/teams/${id.toString()}/` : undefined,
    requestGet,
    swrOptions
  );

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Team> = async (editedTeam, setError) => {
    try {
      await requestPatch<Team>(`/api/v2/teams/${id}/`, editedTeam);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  if (!team) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Edit team')}
          breadcrumbs={[{ label: t('Teams'), to: RouteE.Teams }, { label: t('Edit team') }]}
        />
        <PageBody>
          <PageForm
            submitText={t('Save team')}
            onSubmit={onSubmit}
            onCancel={onCancel}
            defaultValue={team}
          >
            <TeamInputs />
          </PageForm>
        </PageBody>
      </PageLayout>
    );
  }
}

function TeamInputs() {
  const { setValue } = useFormContext();
  const { t } = useTranslation();
  const selectOrganization = useSelectOrganization();
  return (
    <>
      <PageFormTextInput name="name" label="Name" placeholder="Enter name" isRequired />
      <PageFormTextArea name="description" label="Description" placeholder="Enter description" />
      <PageFormTextInput
        name="summary_fields.organization.name"
        label="Organization"
        placeholder="Enter organization"
        selectTitle={t('Select an organization')}
        selectValue={(organization: Organization) => organization.name}
        selectOpen={selectOrganization}
        validate={async (organizationName: string) => {
          try {
            const itemsResponse = await requestGet<ItemsResponse<Organization>>(
              `/api/v2/organizations/?name=${organizationName}`
            );
            if (itemsResponse.results.length === 0) return t('Organization not found.');
            setValue('organization', itemsResponse.results[0].id);
          } catch (err) {
            if (err instanceof Error) return err.message;
            else return 'Unknown error';
          }
          return undefined;
        }}
        isRequired
      />
    </>
  );
}
