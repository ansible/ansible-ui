import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { RouteObj } from '../../../Routes';
import { PageFormExecutionEnvironmentSelect } from '../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Organization } from '../../interfaces/Organization';
import { getAwxError } from '../../useAwxView';

interface OrganizationFields extends FieldValues {
  organization: Organization;
  instanceGroups?: InstanceGroup[];
  id: number;
}

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<{ id: number }, Organization>();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values, setError) => {
    try {
      const organization = await postRequest('/api/v2/organizations/', values.organization);
      const igRequests = [];
      for (const ig of values.instanceGroups || []) {
        igRequests.push(
          postRequest(`/api/v2/organizations/${organization.id}/instance_groups/`, {
            id: ig.id,
          })
        );
      }
      await Promise.all(igRequests);
      navigate(RouteObj.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteObj.Organizations },
          { label: t('Create organization') },
        ]}
      />
      <PageForm submitText={t('Create organization')} onSubmit={onSubmit} onCancel={onCancel}>
        <OrganizationInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const postRequest = usePostRequest();

  const { data: organization } = useSWR<Organization>(
    `/api/v2/organizations/${id.toString()}/`,
    requestGet,
    swrOptions
  );
  const { data: igResponse } = useSWR<{ results: InstanceGroup[] }>(
    `/api/v2/organizations/${id.toString()}/instance_groups/`,
    requestGet,
    swrOptions
  );
  const instanceGroups = igResponse?.results;

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values, setError) => {
    try {
      const organization = await requestPatch<Organization>(
        `/api/v2/organizations/${id}/`,
        values.organization
      );
      const disassociateRequests = [];
      for (const ig of instanceGroups || []) {
        disassociateRequests.push(
          postRequest(`/api/v2/organizations/${organization.id}/instance_groups/`, {
            id: ig.id,
            disassociate: true,
          })
        );
      }
      await Promise.all(disassociateRequests);
      const igRequests = [];
      for (const ig of values.instanceGroups || []) {
        igRequests.push(
          postRequest(`/api/v2/organizations/${organization.id}/instance_groups/`, {
            id: ig.id,
          })
        );
      }
      await Promise.all(igRequests);
      navigate(RouteObj.OrganizationDetails.replace(':id', organization.id.toString()));
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  const onCancel = () => navigate(-1);

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: RouteObj.Organizations },
          { label: t('Edit organization') },
        ]}
      />
      {organization ? (
        <PageForm
          submitText={t('Save organization')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={{ organization, instanceGroups }}
        >
          <OrganizationInputs orgId={organization.id} />
        </PageForm>
      ) : null}
    </PageLayout>
  );
}

function OrganizationInputs(props: { orgId?: number }) {
  const { t } = useTranslation();
  const { orgId } = props;
  return (
    <>
      <PageFormTextInput
        label={t('Name')}
        name="organization.name"
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput
        label={t('Description')}
        name="organization.description"
        placeholder={t('Enter description')}
      />
      <PageFormInstanceGroupSelect<OrganizationFields>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this organization to run on.`)}
      />
      <PageFormExecutionEnvironmentSelect<OrganizationFields>
        organizationId={orgId ? orgId.toString() : undefined}
        name="organization.summary_fields.default_environment.name"
        label={t('Default execution environment')}
        executionEnvironmentPath="organization.summary_fields.default_environment"
        executionEnvironmentIdPath="organization.default_environment"
      />
      {/* TODO: galaxyCredentials */}
    </>
  );
}
