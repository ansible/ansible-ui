import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/useItem';
import { requestPatch, requestPost } from '../../../Data';
import { RouteE } from '../../../Routes';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { getDefaultValues } from './templateFormhelpers';
import JobTemplateInputs from './JobTemplateInputs';

export function EditJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: jobtemplate } = useGet<JobTemplate>(`/api/v2/job_templates/${id.toString()}`);

  const { cache } = useSWRConfig();
  const onSubmit = async (values: object, setError: (message: string) => void) => {
    try {
      await requestPatch<JobTemplate>(`/api/job_templates/${id}`, values);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteE.JobTemplateDetails.replace(':id', `${id}`.toString()));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('TODO');
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit job template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteE.Templates },
          { label: t('Edit job template') },
        ]}
      />
      <PageForm
        submitText={t('Save job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={jobtemplate}
      >
        <JobTemplateInputs />
      </PageForm>
    </PageLayout>
  );
}
export function CreateJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const jobTemplateDefaultValues = getDefaultValues();
  const onSubmit = async (values: JobTemplate, setError: (message: string) => void) => {
    try {
      const { id } = await requestPost<JobTemplate>(`/api/job_templates/`, values);

      navigate(RouteE.JobTemplateDetails.replace(':id', id.toString()));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('TODO');
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create job template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteE.Templates },
          { label: t('Create job template') },
        ]}
      />
      <PageForm<JobTemplate>
        submitText={t('Save job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={jobTemplateDefaultValues}
      >
        <JobTemplateInputs />
      </PageForm>
    </PageLayout>
  );
}
