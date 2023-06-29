import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { ItemsResponse, postRequest, requestGet, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { RouteObj } from '../../../Routes';
import { Credential } from '../../interfaces/Credential';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { Label } from '../../interfaces/Label';
import { getAwxError } from '../../useAwxView';
import { getJobTemplateDefaultValues } from './JobTemplateFormHelpers';
import JobTemplateInputs from './JobTemplateInputs';
import { AwxError } from '../../common/AwxError';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { Organization } from '../../interfaces/Organization';

const stringifyTags: (tags: { value: string }[]) => string = (tags) => {
  const stringifiedTags = tags.filter((tag) => {
    if (tag.value !== '') return tag.value;
  });
  return stringifiedTags.map((i) => i.value).join(',');
};
export function EditJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const {
    data: jobtemplate,
    error: jobTemplateError,
    refresh: jobTemplateRefresh,
    isLoading: isJobTemplateLoading,
  } = useGet<JobTemplate>(`/api/v2/job_templates/${id.toString()}/`);
  const {
    data: instanceGroups,
    error: instanceGroupsError,
    isLoading: isInstanceGroupsLoading,
    refresh: instanceGroupRefresh,
  } = useGet<ItemsResponse<InstanceGroup>>(
    `/api/v2/job_templates/${id.toString()}/instance_groups/`
  );

  const defaultValues: JobTemplateForm = useMemo(
    () =>
      getJobTemplateDefaultValues(t, {
        ...jobtemplate,
        isProvisioningCallbackEnabled: Boolean(jobtemplate?.related?.callback),
        isWebhookEnabled: Boolean(jobtemplate?.related?.webhook_receiver),
        instanceGroups: instanceGroups?.results ?? [],
        arrayedSkipTags: jobtemplate?.skip_tags
          .split(',')
          .map((tag) => ({ value: tag, label: tag })),
        arrayedJobTags: jobtemplate?.job_tags.split(',').map((tag) => ({ value: tag, label: tag })),
      } as JobTemplateForm),
    [t, jobtemplate, instanceGroups]
  );
  const { cache } = useSWRConfig();
  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (
    values: JobTemplateForm,
    setError: (message: string) => void
  ) => {
    const {
      arrayedJobTags,
      arrayedSkipTags,
      summary_fields: { credentials, labels },
    } = values;
    values.project = values.summary_fields.project?.id;
    let jobTags = '';
    let skipTags = '';
    if (arrayedJobTags?.length) {
      jobTags = stringifyTags(arrayedJobTags);
    }
    if (arrayedSkipTags.length) {
      skipTags = stringifyTags(arrayedSkipTags);
    }
    try {
      await requestPatch<JobTemplateForm>(`/api/v2/job_templates/${id}/`, {
        ...values,
        job_tags: jobTags ?? '',
        skip_tags: skipTags ?? '',
        webhook_credential: values.summary_fields.webhook_credential?.id,
      });
      (cache as unknown as { clear: () => void }).clear?.();
      const promises = [];

      promises.push(submitCredentials(jobtemplate as JobTemplate, credentials));
      promises.push(submitLabels(jobtemplate as JobTemplate, labels?.results));
      promises.push(submitInstanceGroups(id, values.instanceGroups));
      navigate(RouteObj.JobTemplateDetails.replace(':id', `${id}`.toString()));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('TODO');
      }
    }
  };
  const jobTemplateFormError = jobTemplateError || instanceGroupsError;
  if (jobTemplateFormError instanceof Error) {
    return (
      <AwxError
        error={jobTemplateFormError}
        handleRefresh={jobTemplateError ? jobTemplateRefresh : instanceGroupRefresh}
      />
    );
  }
  if (isJobTemplateLoading || isInstanceGroupsLoading) return <LoadingPage />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Edit Job Template') },
        ]}
      />
      <PageForm<JobTemplateForm>
        submitText={t('Save job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <JobTemplateInputs jobtemplate={defaultValues} />
      </PageForm>
    </PageLayout>
  );
}
export function CreateJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<JobTemplateForm, JobTemplate>();

  const defaultValues: JobTemplateForm = useMemo(
    () => getJobTemplateDefaultValues(t, {} as JobTemplateForm),
    [t]
  );
  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (values, setError) => {
    const {
      arrayedJobTags,
      arrayedSkipTags,
      summary_fields: { credentials = [], labels, webhook_credential },
    } = values;
    values.project = values?.summary_fields?.project?.id;
    let jobTags = '';
    let skipTags = '';
    if (values?.arrayedJobTags?.length) {
      jobTags = stringifyTags(arrayedJobTags);
    }
    if (values?.arrayedSkipTags.length) {
      skipTags = stringifyTags(arrayedSkipTags);
    }
    try {
      const template = await postRequest(`/api/v2/job_templates/`, {
        ...values,
        job_tags: jobTags,
        skip_tags: skipTags,
        summary_fields: values.summary_fields,
        webhook_credential: webhook_credential?.id ? webhook_credential?.id : null,
      });
      const promises = [];
      if (credentials?.length > 0) {
        promises.push(submitCredentials(template, credentials));
      }
      if (labels?.results && labels?.results?.length > 0) {
        promises.push(submitLabels(template, labels.results));
      }
      if (values.instanceGroups.length > 0) {
        promises.push(submitInstanceGroups(template.id, values.instanceGroups));
      }
      if (promises.length > 0) await Promise.all(promises);

      navigate(RouteObj.JobTemplateDetails.replace(':id', template.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Create Job Template') },
        ]}
      />
      <PageForm<JobTemplateForm>
        submitText={t('Create job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <JobTemplateInputs />
      </PageForm>
    </PageLayout>
  );
}

async function submitCredentials(
  template: JobTemplate,
  newCredentials: Pick<Credential, 'id' | 'name' | 'cloud' | 'description' | 'kind'>[]
) {
  const { added, removed } = getAddedAndRemoved(
    template?.summary_fields?.credentials ?? ([] as Credential[]),
    newCredentials
  );

  const disassociateCredentials = removed.map((cred) =>
    postRequest(`/api/v2/job_templates/${template?.id?.toString()}/credentials`, {
      id: cred.id,
      disassociate: true,
    })
  );
  const disassociatePromise = await Promise.all(disassociateCredentials);
  const associateCredentials = added.map((cred: { id: number }) =>
    postRequest(`/api/v2/job_templates/${template?.id?.toString()}/credentials/`, {
      id: cred.id,
    })
  );

  const associatePromise = await Promise.all(associateCredentials);
  return Promise.all([disassociatePromise, associatePromise]);
}

async function submitLabels(template: JobTemplate, labels: Label[]) {
  const { added, removed } = getAddedAndRemoved(
    template.summary_fields?.labels?.results || ([] as Label[]),
    labels ?? ([] as Label[])
  );

  let orgId = template.summary_fields?.organization?.id;
  if (!template.summary_fields?.organization?.id) {
    // eslint-disable-next-line no-useless-catch
    try {
      const data = await requestGet<ItemsResponse<Organization>>('/api/v2/organizations/');
      orgId = data.results[0].id;
    } catch (err) {
      throw err;
    }
  }
  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(`/api/v2/job_templates/${template.id.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(`/api/v2/job_templates/${template.id.toString()}/labels/`, {
      name: label.name,
      organization: orgId,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}
async function submitInstanceGroups(templateId: number, newInstanceGroups: InstanceGroup[]) {
  const originalInstanceGroups = await requestGet<ItemsResponse<InstanceGroup>>(
    `/api/v2/job_templates/${templateId.toString()}/instance_groups/`
  );
  if (!isEqual(newInstanceGroups, originalInstanceGroups.results)) {
    for (const group of originalInstanceGroups.results) {
      await postRequest(`/api/v2/job_templates/${templateId.toString()}/instance_groups/`, {
        id: group.id,
        disassociate: true,
      });
    }
    for (const group of newInstanceGroups) {
      await await postRequest(`/api/v2/job_templates/${templateId.toString()}/instance_groups/`, {
        id: group.id,
      });
    }
  }
}

function isEqual(array1: InstanceGroup[], array2: InstanceGroup[]) {
  return (
    array1.length === array2.length &&
    array1.every((element, index) => element.id === array2[index].id)
  );
}
