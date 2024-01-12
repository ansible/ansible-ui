import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { PageFormExecutionEnvironmentSelect } from '../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';

interface OrganizationFields extends FieldValues {
  organization: Organization;
  instanceGroups?: InstanceGroup[];
  id: number;
}

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<{ id: number }, Organization>();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values) => {
    const organization = await postRequest(awxAPI`/organizations/`, values.organization);
    const igRequests = [];
    for (const ig of values.instanceGroups || []) {
      igRequests.push(
        postRequest(awxAPI`/organizations/${organization.id.toString()}/instance_groups/`, {
          id: ig.id,
        })
      );
    }
    await Promise.all(igRequests);
    pageNavigate(AwxRoute.OrganizationDetails, { params: { id: organization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(AwxRoute.Organizations) },
          { label: t('Create Organization') },
        ]}
      />
      <AwxPageForm submitText={t('Create organization')} onSubmit={onSubmit} onCancel={onCancel}>
        <OrganizationInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const postRequest = usePostRequest();

  const { data: organization } = useSWR<Organization>(
    awxAPI`/organizations/${id.toString()}/`,
    requestGet,
    swrOptions
  );
  const { data: igResponse } = useSWR<{ results: InstanceGroup[] }>(
    awxAPI`/organizations/${id.toString()}/instance_groups/`,
    requestGet,
    swrOptions
  );
  const instanceGroups = igResponse?.results;

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<OrganizationFields> = async (values) => {
    const organization = await requestPatch<Organization>(
      awxAPI`/organizations/${id.toString()}/`,
      values.organization
    );
    const disassociateRequests = [];
    for (const ig of instanceGroups || []) {
      disassociateRequests.push(
        postRequest(awxAPI`/organizations/${organization.id.toString()}/instance_groups/`, {
          id: ig.id,
          disassociate: true,
        })
      );
    }
    await Promise.all(disassociateRequests);
    const igRequests = [];
    for (const ig of values.instanceGroups || []) {
      igRequests.push(
        postRequest(awxAPI`/organizations/${organization.id.toString()}/instance_groups/`, {
          id: ig.id,
        })
      );
    }
    await Promise.all(igRequests);
    pageNavigate(AwxRoute.OrganizationDetails, { params: { id: organization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(AwxRoute.Organizations) },
          { label: t('Edit Organization') },
        ]}
      />
      {organization ? (
        <AwxPageForm
          submitText={t('Save organization')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={{ organization, instanceGroups }}
        >
          <OrganizationInputs orgId={organization.id} />
        </AwxPageForm>
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
