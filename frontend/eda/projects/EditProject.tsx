import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageBody,
  PageForm,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { useGet } from '../../common/useItem';
import { requestPatch, requestPost } from '../../Data';
import { RouteE } from '../../Routes';
import { EdaProject } from '../interfaces/EdaProject';

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<EdaProject>(`/api/projects/${id.toString()}`);

  const ProjectSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
        url: Type.Optional(
          Type.String({
            title: t('URL'),
            placeholder: t('Enter the URL'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
      }),
    [t]
  );

  type ProjectSchema = Static<typeof ProjectSchemaType>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<ProjectSchema> = async (project, setError) => {
    try {
      if (Number.isInteger(id)) {
        project = await requestPatch<EdaProject>(`/api/projects/${id}`, project);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newProject = await requestPost<EdaProject>('/api/projects', project);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteE.EdaProjectDetails.replace(':id', newProject.id.toString()));
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!project) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Projects'), to: RouteE.EdaProjects },
              { label: t('Edit project') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit project')}
            breadcrumbs={[
              { label: t('Projects'), to: RouteE.EdaProjects },
              { label: t('Edit project') },
            ]}
          />
          <PageBody>
            <PageForm
              schema={ProjectSchemaType}
              submitText={t('Save project')}
              onSubmit={onSubmit}
              cancelText={t('Cancel')}
              onCancel={onCancel}
              defaultValue={project}
            >
              <PageFormSchema schema={ProjectSchemaType} />
            </PageForm>
          </PageBody>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create project')}
          breadcrumbs={[
            { label: t('Projects'), to: RouteE.EdaProjects },
            { label: t('Create project') },
          ]}
        />
        <PageBody>
          <PageForm
            schema={ProjectSchemaType}
            submitText={t('Create project')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
          >
            <PageFormSchema schema={ProjectSchemaType} />
          </PageForm>
        </PageBody>
      </PageLayout>
    );
  }
}
