import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { postRequest, requestGet, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { Credential } from '../../interfaces/Credential';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { JobTemplateCreate, JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { Label } from '../../interfaces/Label';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';
import { getJobTemplateDefaultValues, stringifyTags } from './JobTemplateFormHelpers';
import { JobTemplateInputs } from './JobTemplateInputs';

export function EditJobTemplate() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const {
    data: jobTemplate,
    error: jobTemplateError,
    refresh: jobTemplateRefresh,
    isLoading: isJobTemplateLoading,
  } = useGet<JobTemplate>(awxAPI`/job_templates/${id.toString()}/`);
  const {
    data: instanceGroups,
    error: instanceGroupsError,
    isLoading: isInstanceGroupsLoading,
    refresh: instanceGroupRefresh,
  } = useGet<AwxItemsResponse<InstanceGroup>>(
    awxAPI`/job_templates/${id.toString()}/instance_groups/`
  );

  const defaultValues = useMemo(
    () => getJobTemplateDefaultValues(t, jobTemplate, instanceGroups?.results ?? []),
    [t, jobTemplate, instanceGroups]
  );
  const { cache } = useSWRConfig();
  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (values: JobTemplateForm) => {
    const { credentials, labels, instance_groups, webhook_key, webhook_url, ...rest } = values;
    const formValues = {
      ...rest,
      project: values.project.id,
      execution_environment: values.execution_environment?.id || null,
      inventory: values.inventory?.id || null,
      job_tags: stringifyTags(values.job_tags) ?? '',
      skip_tags: stringifyTags(values.skip_tags) ?? '',
      webhook_credential: values.webhook_credential?.id || null,
    };

    await requestPatch<JobTemplateForm>(awxAPI`/job_templates/${id.toString()}/`, formValues);
    (cache as unknown as { clear: () => void }).clear?.();
    const promises = [];

    promises.push(submitCredentials(jobTemplate as JobTemplate, credentials));
    promises.push(submitLabels(jobTemplate as JobTemplate, labels));
    promises.push(submitInstanceGroups(id, instance_groups));
    await Promise.all(promises);
    pageNavigate(AwxRoute.JobTemplateDetails, { params: { id } });
  };

  const getPageUrl = useGetPageUrl();

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
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          { label: t('Edit Job Template') },
        ]}
      />
      <AwxPageForm<JobTemplateForm>
        submitText={t('Save job template')}
        onSubmit={onSubmit}
        onCancel={() => pageNavigate(AwxRoute.JobTemplateDetails, { params: { id } })}
        defaultValue={defaultValues}
      >
        <JobTemplateInputs jobtemplate={defaultValues} />
      </AwxPageForm>
    </PageLayout>
  );
}
export function CreateJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<JobTemplateCreate, JobTemplate>();
  const defaultValues = useMemo(() => getJobTemplateDefaultValues(t, {} as JobTemplate), [t]);

  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (values) => {
    const { credentials, labels, instance_groups, webhook_key, webhook_url, ...rest } = values;
    const formValues = {
      ...rest,
      project: values.project.id,
      execution_environment: values.execution_environment?.id
        ? values.execution_environment?.id
        : null,
      inventory: values.inventory?.id || null,
      job_tags: stringifyTags(values.job_tags) ?? '',
      skip_tags: stringifyTags(values.skip_tags) ?? '',
      webhook_credential: values.webhook_credential?.id || null,
    };

    const template = await postRequest(awxAPI`/job_templates/`, formValues);
    const promises = [];
    if (credentials?.length > 0) {
      promises.push(submitCredentials(template, credentials));
    }
    if (labels && labels?.length > 0) {
      promises.push(submitLabels(template, labels));
    }
    if (instance_groups.length > 0) {
      promises.push(submitInstanceGroups(template.id, instance_groups));
    }
    if (promises.length > 0) await Promise.all(promises);

    pageNavigate(AwxRoute.JobTemplateDetails, { params: { id: template.id } });
  };

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Job Template')}
        breadcrumbs={[
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          { label: t('Create Job Template') },
        ]}
      />
      <AwxPageForm<JobTemplateForm>
        submitText={t('Create job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <JobTemplateInputs />
      </AwxPageForm>
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
    postRequest(awxAPI`/job_templates/${template?.id?.toString()}/credentials/`, {
      id: cred.id,
      disassociate: true,
    })
  );
  const disassociatePromise = await Promise.all(disassociateCredentials);
  const associateCredentials = added.map((cred: { id: number }) =>
    postRequest(awxAPI`/job_templates/${template?.id?.toString()}/credentials/`, {
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
      const data = await requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`);
      orgId = data.results[0].id;
    } catch (err) {
      throw err;
    }
  }
  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(awxAPI`/job_templates/${template.id.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(awxAPI`/job_templates/${template.id.toString()}/labels/`, {
      name: label.name,
      organization: orgId,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}
async function submitInstanceGroups(templateId: number, newInstanceGroups: InstanceGroup[]) {
  const originalInstanceGroups = await requestGet<AwxItemsResponse<InstanceGroup>>(
    awxAPI`/job_templates/${templateId.toString()}/instance_groups/`
  );
  if (!isEqual(newInstanceGroups, originalInstanceGroups.results)) {
    for (const group of originalInstanceGroups.results) {
      await postRequest(awxAPI`/job_templates/${templateId.toString()}/instance_groups/`, {
        id: group.id,
        disassociate: true,
      });
    }
    for (const group of newInstanceGroups) {
      await await postRequest(awxAPI`/job_templates/${templateId.toString()}/instance_groups/`, {
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
