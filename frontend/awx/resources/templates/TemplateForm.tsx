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

export function EditJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const defaultValues: Partial<JobTemplateForm> = useMemo(
    () => getJobTemplateDefaultValues(t, {} as JobTemplateForm),
    [t]
  );

  const { data: jobtemplate } = useGet<JobTemplate>(`/api/v2/job_templates/${id.toString()}`);

  const { cache } = useSWRConfig();
  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (
    values: object,
    setError: (message: string) => void
  ) => {
    try {
      await requestPatch<JobTemplateForm>(`/api/job_templates/${id}`, values);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteObj.JobTemplateDetails.replace(':id', `${id}`.toString()));
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
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Edit job template') },
        ]}
      />
      <PageForm<JobTemplateForm>
        submitText={t('Save job template')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={defaultValues}
      >
        <JobTemplateInputs jobtemplate={jobtemplate} />
      </PageForm>
    </PageLayout>
  );
}
export function CreateJobTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<JobTemplateForm, JobTemplate>();

  const defaultValues: Partial<JobTemplateForm> = useMemo(
    () => getJobTemplateDefaultValues(t, {} as JobTemplateForm),
    [t]
  );
  const onSubmit: PageFormSubmitHandler<JobTemplateForm> = async (
    values: JobTemplateForm,
    setError
  ) => {
    const {
      instanceGroups = [],
      summary_fields: { credentials = [], labels },
    } = values;

    try {
      const template = await postRequest(`/api/v2/job_templates/`, values);
      const promises = [];
      if (credentials?.length > 0) {
        promises.push(submitCredentials(template, credentials));
      }
      if (labels?.results && labels?.results?.length > 0) {
        promises.push(
          submitLabels(template.id, template.summary_fields.organization.id, labels.results)
        );
      }
      if (instanceGroups.length > 0) {
        promises.push(submitInstanceGroups(template.id, instanceGroups));
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
        title={t('Create job template')}
        breadcrumbs={[
          { label: t('Templates'), to: RouteObj.Templates },
          { label: t('Create job template') },
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

async function submitCredentials(template: JobTemplate, newCredentials: Credential[]) {
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

async function submitLabels(template: number, orgId: number, labels: Label[]) {
  const { added, removed } = getAddedAndRemoved(
    labels || ([] as Label[]),
    labels ?? ([] as Label[])
  );

  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(`/api/v2/job_templates/${template.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(`/api/v2/job_templates/${template.toString()}/labels/`, {
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
