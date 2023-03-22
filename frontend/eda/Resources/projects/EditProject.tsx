import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { requestPatch, requestPost } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaProject } from '../../interfaces/EdaProject';

export function EditProject() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: project } = useGet<EdaProject>(`${API_PREFIX}/projects/${id.toString()}/`);

  const ProjectSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Insert name here'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
        description: Type.Optional(
          Type.String({
            title: t('Description'),
            placeholder: t('Insert description here '), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
        type: Type.Optional(
          Type.String({
            title: t('SCM type'),
            default: 'Git',
            placeholder: t('Select type'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
        url: Type.Optional(
          Type.String({
            title: t('SCM URL'),
            placeholder: t('Enter the URL'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
          })
        ),
        token: Type.Optional(
          Type.String({
            title: t('SCM token'),
            placeholder: t('Insert token here'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
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
        await requestPatch<EdaProject>(`${API_PREFIX}/projects/${id}/`, project);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newProject = await requestPost<EdaProject>(`${API_PREFIX}/projects/`, project);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteObj.EdaProjectDetails.replace(':id', newProject.id.toString()));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unknown error'));
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
              { label: t('Projects'), to: RouteObj.EdaProjects },
              { label: t('Edit project') },
            ]}
          />
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
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create project')}
          breadcrumbs={[
            { label: t('Projects'), to: RouteObj.EdaProjects },
            { label: t('Create project') },
          ]}
        />
        <PageForm
          schema={ProjectSchemaType}
          submitText={t('Create project')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={ProjectSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
