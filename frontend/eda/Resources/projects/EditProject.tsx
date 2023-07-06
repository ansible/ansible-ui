import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useIsValidUrl } from '../../../common/validation/useIsValidUrl';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaProject, EdaProjectCreate } from '../../interfaces/EdaProject';
import { EdaResult } from '../../interfaces/EdaResult';

function ProjectCreateInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
  const isValidUrl = useIsValidUrl();
  return (
    <>
      <PageFormTextInput<EdaProjectCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaProjectCreate>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormTextInput
        name="type"
        aria-disabled={true}
        isDisabled={true}
        label={t('SCM type')}
        placeholder={t('Git')}
        labelHelpTitle={t('SCM type')}
        labelHelp={t('There is currently only one SCM available for use.')}
      />
      <PageFormTextInput<EdaProjectCreate>
        name="url"
        isRequired={true}
        label={t('SCM URL')}
        placeholder={t('Enter SCM URL')}
        validate={isValidUrl}
        labelHelpTitle={t('SCM URL')}
        labelHelp={t('HTTP[S] protocol address of a repository, such as GitHub or GitLab.')}
      />
      <PageFormSelectOption
        name={'credential_id'}
        label={t('Credential')}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={<Link to={RouteObj.CreateCredential}>Create credential</Link>}
        labelHelpTitle={t('Credential')}
        labelHelp={t('The token needed to utilize the SCM URL.')}
      />
    </>
  );
}

function ProjectEditInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
  return (
    <>
      <PageFormTextInput<EdaProjectCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaProjectCreate>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormTextInput
        name="type"
        aria-disabled={true}
        isDisabled={true}
        label={t('SCM type')}
        placeholder={t('Git')}
      />
      <PageFormSelectOption
        name={'credential_id'}
        label={t('Credential')}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={<Link to={RouteObj.CreateCredential}>Create credential</Link>}
      />
    </>
  );
}

export function CreateProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaProjectCreate, EdaProject>();

  const onSubmit: PageFormSubmitHandler<EdaProjectCreate> = async (project) => {
    const newProject = await postRequest(`${API_PREFIX}/projects/`, project);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(RouteObj.EdaProjectDetails.replace(':id', newProject.id.toString()));
  };

  const onCancel = () => navigate(-1);
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Project')}
        breadcrumbs={[
          { label: t('Projects'), to: RouteObj.EdaProjects },
          { label: t('Create Project') },
        ]}
      />
      <PageForm
        submitText={t('Create project')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ProjectCreateInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<EdaProject>(`${API_PREFIX}/projects/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<EdaProjectCreate, EdaProjectCreate>();

  const onSubmit: PageFormSubmitHandler<EdaProjectCreate> = async (project) => {
    await patchRequest(`${API_PREFIX}/projects/${id}/`, project);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);

  if (!project) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Projects'), to: RouteObj.EdaProjects },
            { label: t('Edit Project') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${project?.name || t('Project')}`}
          breadcrumbs={[
            { label: t('Projects'), to: RouteObj.EdaProjects },
            { label: `${t('Edit')} ${project?.name || t('Project')}` },
          ]}
        />
        <PageForm
          submitText={t('Save project')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{ ...project, credential_id: project?.credential_id }}
        >
          <ProjectEditInputs />
        </PageForm>
      </PageLayout>
    );
  }
}
