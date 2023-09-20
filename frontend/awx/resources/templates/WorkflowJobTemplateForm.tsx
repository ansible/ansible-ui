import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../common/Routes';
import { postRequest, requestGet, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import {
  WorkflowJobTemplate,
  WorkflowJobTemplateCreate,
  WorkflowJobTemplateForm,
} from '../../interfaces/WorkflowJobTemplate';
import { Label } from '../../interfaces/Label';
import { Organization } from '../../interfaces/Organization';
import { WorkflowJobTemplateInputs } from './WorkflowJobTemplateInputs';
import { parseStringToTagArray, stringifyTags } from './JobTemplateFormHelpers';

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

  const onSubmit: PageFormSubmitHandler<WorkflowJobTemplateForm> = async (
    values: WorkflowJobTemplateForm
  ) => {
    const { labels, ...rest } = values;

    await requestPatch<WorkflowJobTemplateForm>(`/api/v2/workflow_job_templates/${id}/`, {
      ...rest,
      inventory: values.inventory?.id || null,
      job_tags: stringifyTags(values.job_tags) ?? '',
      organization: values.organization?.id || null,
      skip_tags: stringifyTags(values.skip_tags) ?? '',
      webhook_credential: values.webhook_credential?.id || null,
      webhook_service: values.webhook_service || '',
    });
    (cache as unknown as { clear: () => void }).clear?.();

    await submitLabels(workflowJobTemplate as WorkflowJobTemplate, labels);
    navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', `${id}`.toString()));
  };

  const defaultValues = useMemo(() => {
    if (!workflowJobTemplate) return;
    return {
      allow_simultaneous: workflowJobTemplate.allow_simultaneous || false,
      ask_inventory_on_launch: workflowJobTemplate.ask_inventory_on_launch || false,
      ask_labels_on_launch: workflowJobTemplate.ask_labels_on_launch || false,
      ask_limit_on_launch: workflowJobTemplate.ask_limit_on_launch || false,
      ask_scm_branch_on_launch: workflowJobTemplate.ask_scm_branch_on_launch || false,
      ask_skip_tags_on_launch: workflowJobTemplate.ask_skip_tags_on_launch || false,
      ask_tags_on_launch: workflowJobTemplate.ask_tags_on_launch || false,
      ask_variables_on_launch: workflowJobTemplate.ask_variables_on_launch || false,
      description: workflowJobTemplate.description || '',
      extra_vars: workflowJobTemplate.extra_vars || '---',
      inventory: workflowJobTemplate.summary_fields.inventory || null,
      isWebhookEnabled: Boolean(workflowJobTemplate.related?.webhook_receiver),
      job_tags: parseStringToTagArray(workflowJobTemplate.skip_tags || ''),
      organization: workflowJobTemplate.summary_fields.organization || null,
      labels: workflowJobTemplate.summary_fields?.labels?.results || [],
      limit: workflowJobTemplate.limit || '',
      name: workflowJobTemplate.name || '',
      scm_branch: workflowJobTemplate.scm_branch || '',
      skip_tags: parseStringToTagArray(workflowJobTemplate.job_tags || ''),
      webhook_credential: workflowJobTemplate.summary_fields.webhook_credential || null,
      webhook_key: workflowJobTemplate.related.webhook_key || '',
      webhook_receiver: workflowJobTemplate.related.webhook_receiver,
      webhook_service: workflowJobTemplate.webhook_service || '',
    };
  }, [workflowJobTemplate]);
  const { cache } = useSWRConfig();

  if (error instanceof Error) {
    return <AwxError error={error} handleRefresh={refresh} />;
  }
  if (isLoading) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Workflow Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Edit Workflow Job Template') },
        ]}
      />
      <PageForm<WorkflowJobTemplateForm>
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
  const postRequest = usePostRequest<WorkflowJobTemplateCreate, WorkflowJobTemplate>();

  const onSubmit: PageFormSubmitHandler<WorkflowJobTemplateForm> = async (values) => {
    const { labels, webhook_credential, ...rest } = values;

    const template = await postRequest(`/api/v2/workflow_job_templates/`, {
      ...rest,
      inventory: values.inventory?.id,
      job_tags: stringifyTags(values.job_tags || ''),
      organization: values.organization?.id,
      skip_tags: stringifyTags(values.skip_tags || ''),
      webhook_credential: webhook_credential?.id ?? null,
    });

    await submitLabels(template, labels);

    navigate(RouteObj.WorkflowJobTemplateDetails.replace(':id', template.id.toString()));
  };

  const defaultValues = useMemo(
    () => ({
      job_tags: parseStringToTagArray('') || [],
      skip_tags: parseStringToTagArray('') || [],
      extra_vars: '---\n',
    }),
    []
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Workflow Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Create Workflow Job Template') },
        ]}
      />
      <PageForm<WorkflowJobTemplateForm>
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

async function submitLabels(
  template: WorkflowJobTemplate,
  labels: { id: number; name: string }[] | []
) {
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
    postRequest(`/api/v2/workflow_job_templates/${template.id.toString()}/labels/`, {
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
