import { useEffect } from 'react';
import { FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageForm,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { requestPatch } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../../access/organizations/utils/getOrganizationByName';
import { PageFormExecutionEnvironmentSelect } from '../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Organization } from '../../../interfaces/Organization';
import { Project, SCMType } from '../../../interfaces/Project';
import { getAwxError } from '../../../useAwxView';
import { PageFormCredentialSelect } from '../../credentials/components/PageFormCredentialSelect';
import { ArchiveSubForm } from '../ProjectSubForms/ArchiveSubForm';
import { GitSubForm } from '../ProjectSubForms/GitSubForm';
import { InsightsSubForm } from '../ProjectSubForms/InsightsSubForm';
import { ManualSubForm } from '../ProjectSubForms/ManualSubForm';
import { SvnSubForm } from '../ProjectSubForms/SvnSubForm';
import { useGetCredentialTypeIDs } from '../hooks/useGetCredentialTypeIDs';

export interface ProjectFields extends FieldValues {
  project: Omit<Project, 'scm_type'> & {
    scm_type?: '' | 'git' | 'svn' | 'insights' | 'archive' | 'manual' | null;
  };
  id: number;
}

const defaultValues: Partial<Project> = {
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
      if (
        !project.signature_validation_credential ||
        !project.summary_fields.signature_validation_credential.name
      ) {
        project.signature_validation_credential = null;
      }
      if (!project.summary_fields.default_environment.name) {
        project.default_environment = null;
      }

      // Create new project
      const newProject = await postRequest('/api/v2/projects/', project as Project);

      navigate(RouteObj.ProjectDetails.replace(':id', newProject.id.toString()));
    } catch (err) {
      setError(getAwxError(err));
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
        !editedProject.summary_fields.signature_validation_credential.name
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
      setError(getAwxError(err));
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
      <PageForm<ProjectFields>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scmFormFieldDefaults: { [key: string]: any } = {
  scm_url: '',
  scm_branch: '',
  scm_refspec: '',
  credential: null,
  signature_validation_credential: null,
  scm_clean: false,
  scm_delete_on_update: false,
  scm_track_submodules: false,
  scm_update_on_launch: false,
  allow_override: false,
  scm_update_cache_timeout: 0,
};

function ProjectInputs(props: { project?: Project }) {
  const { t } = useTranslation();
  const org = useWatch({ name: 'project.summary_fields.organization' }) as Organization;
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/projects/');
  const scmTypeOptions = data?.actions?.GET?.scm_type?.choices;
  const credentialTypeIDs = useGetCredentialTypeIDs();
  const scmType = useWatch({ name: 'project.scm_type' }) as SCMType;
  const { project } = props;
  const { setValue } = useFormContext();

  // Reset SCM fields when the source control type is changed
  useEffect(() => {
    const resetSCMTypeFields = () => {
      if (project !== undefined && scmType && scmType === project.scm_type) {
        Object.keys(scmFormFieldDefaults).forEach((field) => {
          setValue(`project.${field}`, project[field as keyof Project]);
        });
        // Reset contents of credential fields
        setValue(
          'project.summary_fields.credential.name',
          project.summary_fields.credential?.name ?? ''
        );
        setValue(
          'project.summary_fields.signature_validation_credential.name',
          project.summary_fields.signature_validation_credential?.name ?? ''
        );
      } else {
        Object.keys(scmFormFieldDefaults).forEach((field) => {
          setValue(`project.${field}`, scmFormFieldDefaults[field]);
        });
        // Reset contents of credential fields
        setValue('project.summary_fields.credential.name', '');
        setValue('project.summary_fields.signature_validation_credential.name', '');
      }
    };
    resetSCMTypeFields();
  }, [project, props.project, scmType, setValue]);

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
      <PageFormSelect<ProjectFields>
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
