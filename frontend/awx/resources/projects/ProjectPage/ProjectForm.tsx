import { useTranslation } from 'react-i18next';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../../framework';
import { PageFormSelectOrganization } from '../../../access/organizations/components/PageFormOrganizationSelect';
import { Project } from '../../../interfaces/Project';
import { PageFormExecutionEnvironmentSelect } from '../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { Organization } from '../../../interfaces/Organization';
import { useNavigate, useParams } from 'react-router-dom';
import { RouteObj } from '../../../../Routes';
import { FieldValues, useWatch } from 'react-hook-form';
import { getOrganizationByName } from '../../../access/organizations/utils/getOrganizationByName';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { getAwxError } from '../../../useAwxView';
import { ManualSubForm } from '../ProjectSubForms/ManualSubForm';
import { GitSubForm } from '../ProjectSubForms/GitSubForm';
import { PageFormCredentialSelect } from '../../credentials/components/PageFormCredentialSelect';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';
import { SvnSubForm } from '../ProjectSubForms/SvnSubForm';
import { ArchiveSubForm } from '../ProjectSubForms/ArchiveSubForm';
import { InsightsSubForm } from '../ProjectSubForms/InsightsSubForm';
import { useGet } from '../../../../common/crud/useGet';
import { requestPatch } from '../../../../common/crud/Data';

export interface ProjectFields extends FieldValues {
  project: Omit<Project, 'scm_type'> & {
    scm_type?: '' | 'git' | 'svn' | 'insights' | 'archive' | 'manual' | null;
  };
  id: number;
}

const defaultValues: Partial<Project> = {
  allow_override: false,
  base_dir: '',
  credential: null,
  local_path: '',
  scm_branch: '',
  scm_clean: false,
  scm_delete_on_update: false,
  scm_track_submodules: false,
  scm_refspec: '',
  scm_type: '',
  scm_update_cache_timeout: 0,
  scm_update_on_launch: false,
  scm_url: '',
  signature_validation_credential: null,
  default_environment: null,
};

export function CreateProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Project>();
  const onSubmit: PageFormSubmitHandler<ProjectFields> = async (values, setError) => {
    const { project } = values;

    try {
      if (project.summary_fields.organization.name) {
        try {
          const organization = await getOrganizationByName(
            project.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          project.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      }
      if (project.scm_type === 'manual') {
        project.scm_type = '';
      }

      // Depending on the permissions of the user submitting the form,
      // the API might throw an unexpected error if our creation request
      // has a zero-length string as its credential field. As a work-around,
      // normalize falsey credential fields by deleting them.
      if (!project.credential || !project.summary_fields.credential.name) {
        project.credential = null;
      }
      if (!project.signature_validation_credential || !project.summary_fields.credential.name) {
        project.signature_validation_credential = null;
      }
      if (!project.summary_fields.default_environment.name) {
        project.default_environment = null;
      }

      // Create new project
      const newProject = await postRequest('/api/v2/projects/', project as Project);

      navigate(RouteObj.ProjectDetails.replace(':id', newProject.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Project')}
        breadcrumbs={[
          { label: t('Projects'), to: RouteObj.Projects },
          { label: t('Create Project') },
        ]}
      />
      <PageForm
        submitText={t('Create project')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{
          project: { ...defaultValues },
        }}
      >
        <ProjectInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<Project>(`/api/v2/projects/${id.toString()}/`);

  if (project && project.scm_type === '') {
    project.scm_type = 'manual';
  }

  const onSubmit: PageFormSubmitHandler<ProjectFields> = async (values, setError) => {
    const { project: editedProject } = values;

    try {
      if (editedProject.summary_fields.organization.name) {
        try {
          const organization = await getOrganizationByName(
            editedProject.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          editedProject.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      }
      if (editedProject.scm_type === 'manual') {
        editedProject.scm_type = '';
      }

      // Depending on the permissions of the user submitting the form,
      // the API might throw an unexpected error if our creation request
      // has a zero-length string as its credential field. As a work-around,
      // normalize falsey credential fields by deleting them.
      if (!editedProject.credential || !editedProject.summary_fields.credential.name) {
        editedProject.credential = null;
      }
      if (
        !editedProject.signature_validation_credential ||
        !editedProject.summary_fields.credential.name
      ) {
        editedProject.signature_validation_credential = null;
      }
      if (!editedProject.summary_fields.default_environment.name) {
        editedProject.default_environment = null;
      }

      // Update project
      const updatedProject = await requestPatch<Project>(
        `/api/v2/projects/${id.toString()}/`,
        editedProject
      );

      navigate(RouteObj.ProjectDetails.replace(':id', updatedProject.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };

  if (!project) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Projects'), to: RouteObj.Projects },
            { label: t('Edit Project') },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Project')}
        breadcrumbs={[
          { label: t('Projects'), to: RouteObj.Projects },
          { label: t('Edit Project') },
        ]}
      />
      <PageForm
        submitText={t('Save project')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{
          project,
        }}
      >
        <ProjectInputs project={project} />
      </PageForm>
    </PageLayout>
  );
}

function ProjectInputs(props: { project?: Project }) {
  const { t } = useTranslation();
  const org = useWatch({ name: 'project.summary_fields.organization' }) as Organization;
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/projects/');
  const scmTypeOptions = data?.actions?.GET?.scm_type?.choices;
  const credentialTypeIDs = useGetCredentialTypeIDs();
  return (
    <>
      <PageFormTextInput
        name="project.name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput
        label={t('Description')}
        name="project.description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<ProjectFields>
        name="project.summary_fields.organization"
        isRequired
      />
      <PageFormExecutionEnvironmentSelect<ProjectFields>
        organizationId={org?.id ? org.id.toString() : undefined}
        name="project.summary_fields.default_environment.name"
        label={t('Execution environment')}
        executionEnvironmentIdPath="project.default_environment"
        isDisabled={!org}
        tooltip={
          org ? '' : t(`Select an organization before editing the default execution environment.`)
        }
      />
      <PageFormSelectOption<ProjectFields>
        isRequired
        name="project.scm_type"
        id="source_control_type"
        label={t('Source Control Type')}
        options={
          scmTypeOptions
            ? scmTypeOptions.map(([value, label]) => ({
                label: label,
                value: value === '' ? 'manual' : value,
              }))
            : []
        }
        placeholderText={t('Choose a Source Control Type')}
      />
      <PageFormCredentialSelect<ProjectFields>
        name="project.summary_fields.signature_validation_credential.name"
        credentialIdPath="project.signature_validation_credential"
        label={t('Content Signature Validation Credential')}
        labelHelpTitle={t('Content Signature Validation Credential')}
        labelHelp={t(
          'Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.'
        )}
        selectTitle={t('Select Signature Validation Credential')}
        credentialType={credentialTypeIDs.cryptography}
      />
      <ManualSubForm
        localPath={props.project?.local_path ? props.project?.local_path : undefined}
      />
      <GitSubForm />
      <SvnSubForm />
      <ArchiveSubForm />
      <InsightsSubForm />
    </>
  );
}
