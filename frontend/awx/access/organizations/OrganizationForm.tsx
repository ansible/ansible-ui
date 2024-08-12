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
import { PageFormSelectExecutionEnvironment } from '../../administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';

type IOrganizationData = Organization & {
  instanceGroups?: InstanceGroup[];
};

export function CreateOrganization() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<{ id: number }, Organization>();

  const onSubmit: PageFormSubmitHandler<IOrganizationData> = async (values) => {
    const { instanceGroups, ...organization } = values;
    const createdOrganization = await postRequest(awxAPI`/organizations/`, organization);
    const igRequests = [];
    for (const ig of values.instanceGroups || []) {
      igRequests.push(
        postRequest(awxAPI`/organizations/${createdOrganization.id.toString()}/instance_groups/`, {
          id: ig.id,
        })
      );
    }
    await Promise.all(igRequests);
    pageNavigate(AwxRoute.OrganizationDetails, { params: { id: createdOrganization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create organization')}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(AwxRoute.Organizations) },
          { label: t('Create organization') },
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
  const originalInstanceGroups = igResponse?.results;

  useInvalidateCacheOnUnmount();

  const onSubmit: PageFormSubmitHandler<IOrganizationData> = async (values) => {
    const { instanceGroups, ...organization } = values;
    const { added, removed } = getAddedAndRemoved(
      originalInstanceGroups || [],
      instanceGroups || []
    );
    const editedOrganization = await requestPatch<Organization>(
      awxAPI`/organizations/${id.toString()}/`,
      organization
    );
    const disassociateRequests = [];
    for (const ig of removed || []) {
      disassociateRequests.push(
        postRequest(awxAPI`/organizations/${editedOrganization.id.toString()}/instance_groups/`, {
          id: ig.id,
          disassociate: true,
        })
      );
    }
    await Promise.all(disassociateRequests);
    const igRequests = [];
    for (const ig of added || []) {
      igRequests.push(
        postRequest(awxAPI`/organizations/${editedOrganization.id.toString()}/instance_groups/`, {
          id: ig.id,
        })
      );
    }
    await Promise.all(igRequests);
    pageNavigate(AwxRoute.OrganizationDetails, { params: { id: editedOrganization.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={
          organization?.name
            ? t('Edit {{organizationName}}', { organizationName: organization?.name })
            : t('Organization')
        }
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(AwxRoute.Organizations) },
          {
            label: organization?.name
              ? t('Edit {{organizationName}}', { organizationName: organization?.name })
              : t('Organization'),
          },
        ]}
      />
      {organization ? (
        <AwxPageForm
          submitText={t('Save organization')}
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValue={{
            ...organization,
            instanceGroups: originalInstanceGroups ?? [],
          }}
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
      <PageFormTextInput<IOrganizationData>
        label={t('Name')}
        name="name"
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<IOrganizationData>
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormInstanceGroupSelect<IOrganizationData>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this organization to run on.`)}
      />
      <PageFormSelectExecutionEnvironment<IOrganizationData>
        name="default_environment"
        label={t('Default execution environment')}
        organizationId={orgId}
      />
      {/* TODO: galaxyCredentials */}
    </>
  );
}
