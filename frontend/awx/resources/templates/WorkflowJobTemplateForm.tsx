import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../Routes';
import { postRequest, requestGet, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { Label } from '../../interfaces/Label';
import { Organization } from '../../interfaces/Organization';
import { getAwxError } from '../../useAwxView';
import { WorkflowJobTemplateInputs } from './WorkflowJobTemplateInputs';

export type WorkflowJobTemplateFormType = WorkflowJobTemplate & {
  arrayedSkipTags: { label: string; value: string }[];
  arrayedJobTags: { label: string; value: string }[];
  isWebhookEnabled: boolean;
};
const stringifyTags: (tags: { value: string; label: string }[]) => string = (tags) => {
  const stringifiedTags = tags.filter((tag) => {
    if (tag.value !== '') return tag.value;
  });
  return stringifiedTags.map((i) => i.value).join(',');
};
export function EditWorkflowJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();

  const id = Number(params.id);
  const {
    data: workflowJobTemplate,
    error,
    refresh,
    isLoading,
  } = useGet<WorkflowJobTemplate>(`/api/v2/workflow_job_templates/${id.toString()}/`);

  const defaultValues: WorkflowJobTemplateFormType = useMemo(
    () =>
      ({
        ...workflowJobTemplate,
        isWebhookEnabled: Boolean(workflowJobTemplate?.related?.webhook_receiver),
        arrayedSkipTags: workflowJobTemplate?.skip_tags
          .split(',')
          .map((tag) => ({ value: tag, label: tag })),
        arrayedJobTags: workflowJobTemplate?.job_tags
          .split(',')
          .map((tag) => ({ value: tag, label: tag })),
      }) as WorkflowJobTemplateFormType,
    [workflowJobTemplate]
  );
  const { cache } = useSWRConfig();
  const onSubmit: PageFormSubmitHandler<WorkflowJobTemplateFormType> = async (
    values: WorkflowJobTemplateFormType,
    setError: (message: string) => void
  ) => {
    const {
      arrayedJobTags,
      arrayedSkipTags,
      summary_fields: { labels },
    } = values;

    let jobTags = '';
    let skipTags = '';
    if (arrayedJobTags?.length) {
      jobTags = stringifyTags(arrayedJobTags);
    }
    if (arrayedSkipTags.length) {
      skipTags = stringifyTags(arrayedSkipTags);
    }
    try {
      await requestPatch<WorkflowJobTemplate>(`/api/v2/workflow_job_templates/${id}/`, {
        ...values,
        job_tags: jobTags ?? '',
        skip_tags: skipTags ?? '',
        webhook_credential: values.summary_fields.webhook_credential?.id,
      });
      (cache as unknown as { clear: () => void }).clear?.();
      const promises = [];

      promises.push(submitLabels(workflowJobTemplate as WorkflowJobTemplate, labels?.results));
      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', `${id}`.toString()));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('TODO');
      }
    }
  };
  if (error instanceof Error) {
    return <AwxError error={error} handleRefresh={refresh} />;
  }
  if (isLoading) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Edit Job Template') },
        ]}
      />
      <PageForm<WorkflowJobTemplateFormType>
        submitText={t('Save workflow job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <WorkflowJobTemplateInputs workflowJobTemplate={defaultValues} />
      </PageForm>
    </PageLayout>
  );
}
export function CreateWorkflowJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<WorkflowJobTemplate>();

  const defaultValues: {
    arrayedSkipTags: { value: string; label: string }[];
    arrayedJobTags: { value: string; label: string }[];
  } = useMemo(
    () => ({
      arrayedSkipTags: [{ value: '', label: '' }],
      arrayedJobTags: [{ value: '', label: '' }],
    }),
    []
  );
  const onSubmit: PageFormSubmitHandler<WorkflowJobTemplateFormType> = async (values, setError) => {
    const {
      arrayedJobTags,
      arrayedSkipTags,
      summary_fields: { labels, webhook_credential },
    } = values;
    let jobTags = '';
    let skipTags = '';
    if (values?.arrayedJobTags?.length) {
      jobTags = stringifyTags(arrayedJobTags);
    }
    if (values?.arrayedSkipTags.length) {
      skipTags = stringifyTags(arrayedSkipTags);
    }
    try {
      const template = await postRequest(`/api/v2/workflow_job_templates/`, {
        ...values,
        job_tags: jobTags,
        skip_tags: skipTags,
        summary_fields: values.summary_fields,
        webhook_credential: webhook_credential?.id ? webhook_credential?.id : null,
      });
      const promises = [];

      if (labels?.results && labels?.results?.length > 0) {
        promises.push(submitLabels(template, labels.results));
      }

      if (promises.length > 0) await Promise.all(promises);

      navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Workflow Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Create Workflow Job Template') },
        ]}
      />
      <PageForm<WorkflowJobTemplateFormType>
        submitText={t('Create workflow job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <WorkflowJobTemplateInputs />
      </PageForm>
    </PageLayout>
  );
}

async function submitLabels(template: WorkflowJobTemplate, labels: { id: number; name: string }[]) {
  const { added, removed } = getAddedAndRemoved(
    template.summary_fields?.labels?.results || ([] as Label[]),
    labels ?? ([] as Label[])
  );

  let orgId = template?.organization;
  if (!template.summary_fields?.organization?.id) {
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await requestGet<AwxItemsResponse<Organization>>('/api/v2/organizations/');
      orgId = data.results[0].id;
    } catch (err) {
      throw err;
    }
  }
  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(`/api/v2/worflow_job_templates/${template.id.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(`/api/v2/workflow_job_templates/${template.id.toString()}/labels/`, {
      name: label.name,
      organization: orgId,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}
