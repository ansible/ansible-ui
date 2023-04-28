import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useIsValidUrl } from '../../../common/validation/useIsValidUrl';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaCredential } from '../../interfaces/EdaCredential';

function ProjectCreateInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
  const isValidUrl = useIsValidUrl();
  return (
    <>
      <PageFormTextInput<EdaProject>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaProject>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormTextInput<EdaProject>
        name="type"
        isReadOnly={true}
        label={t('SCM type')}
        placeholder={t('Git')}
      />
      <PageFormTextInput<EdaProject>
        name="url"
        isRequired={true}
        label={t('SCM URL')}
        placeholder={t('Enter SCM URL')}
        validate={isValidUrl}
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
      />
    </>
  );
}

function ProjectEditInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
  return (
    <>
      <PageFormTextInput<EdaProject>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
      />
      <PageFormTextInput<EdaProject>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormTextInput<EdaProject>
        name="type"
        isReadOnly={true}
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
      />
    </>
  );
}

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<EdaProject>(`${API_PREFIX}/projects/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<Partial<EdaProject>, EdaProject>();

  const onSubmit: PageFormSubmitHandler<EdaProject> = async (project) => {
    if (Number.isInteger(id)) {
      await requestPatch<EdaProject>(`${API_PREFIX}/projects/${id}/`, project);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } else {
      const newProject = await postRequest(`${API_PREFIX}/projects/`, project);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteObj.EdaProjectDetails.replace(':id', newProject.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
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
            defaultValue={{ ...project, credential_id: project?.credential?.id || undefined }}
          >
            <ProjectEditInputs />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
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
}
