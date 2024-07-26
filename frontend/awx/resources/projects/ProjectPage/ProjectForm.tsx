import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../../../access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectOrganization } from '../../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormSelectExecutionEnvironment } from '../../../administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ArchiveSubForm } from '../ProjectSubForms/ArchiveSubForm';
import { GitSubForm } from '../ProjectSubForms/GitSubForm';
import { InsightsSubForm } from '../ProjectSubForms/InsightsSubForm';
import { ManualSubForm } from '../ProjectSubForms/ManualSubForm';
import { SvnSubForm } from '../ProjectSubForms/SvnSubForm';

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
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Project>();
  const onSubmit: PageFormSubmitHandler<Project> = async (project: Project) => {
    if (project.scm_type === 'manual') {
      project.scm_type = '';
    }
    // Create new project
    const newProject = await postRequest(awxAPI`/projects/`, project);

    pageNavigate(AwxRoute.ProjectDetails, { params: { id: newProject.id } });
  };

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Project')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
          { label: t('Create Project') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create project')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues as Project}
      >
        <ProjectInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<Project>(awxAPI`/projects/${id.toString()}/`);

  if (project && project.scm_type === '') {
    project.scm_type = 'manual';
  }

  const onSubmit: PageFormSubmitHandler<Project> = async (project: Project) => {
    if (project.scm_type === 'manual') {
      project.scm_type = '';
    }

    // Update project
    const updatedProject = await requestPatch<Project>(
      awxAPI`/projects/${id.toString()}/`,
      project
    );

    pageNavigate(AwxRoute.ProjectDetails, { params: { id: updatedProject.id } });
  };

  const getPageUrl = useGetPageUrl();

  if (!project) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
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
          { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
          { label: t('Edit Project') },
        ]}
      />
      <AwxPageForm<Project>
        submitText={t('Save project')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={project}
      >
        <ProjectInputs project={project} />
      </AwxPageForm>
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
  const organizationId = useWatch<Project, 'organization'>({ name: 'organization' });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/projects/`);
  const scmTypeOptions = data?.actions?.GET?.scm_type?.choices;
  const scmType = useWatch<Project, 'scm_type'>({ name: 'scm_type' });
  const { project } = props;
  const { setValue } = useFormContext();

  // Reset SCM fields when the source control type is changed
  useEffect(() => {
    const resetSCMTypeFields = () => {
      if (project !== undefined && scmType && scmType === project.scm_type) {
        Object.keys(scmFormFieldDefaults).forEach((field) => {
          setValue(`${field}`, project[field as keyof Project]);
        });
      } else {
        Object.keys(scmFormFieldDefaults).forEach((field) => {
          setValue(`${field}`, scmFormFieldDefaults[field]);
        });
      }
    };
    resetSCMTypeFields();
  }, [project, scmType, setValue]);

  return (
    <>
      <PageFormTextInput<Project>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<Project>
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<Project> name="organization" isRequired />
      <PageFormSelectExecutionEnvironment<Project>
        name="default_environment"
        organizationId={organizationId}
        label={t('Execution environment')}
        isDisabled={
          organizationId === undefined
            ? t('Select an organization before editing the default execution environment.')
            : undefined
        }
      />
      <PageFormSelect<Project>
        isRequired
        name="scm_type"
        id="source_control_type"
        label={t('Source control type')}
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
      <PageFormCredentialSelect<Project>
        id="signature_validation_credential"
        name="signature_validation_credential"
        label={t('Content signature validation credential')}
        labelHelp={t(
          'Enable content signing to verify that the content has remained secure when a project is synced. If the content has been tampered with, the job will not run.'
        )}
        queryParams={{
          credential_type__namespace: 'gpg_public_key',
        }}
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
