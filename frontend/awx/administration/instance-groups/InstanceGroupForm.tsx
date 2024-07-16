import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxPageForm } from '../../common/AwxPageForm';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { awxAPI } from '../../common/api/awx-utils';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetItem } from '../../../common/crud/useGet';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
type InstanceGroupPayload = Partial<
  Pick<
    InstanceGroup,
    | 'name'
    | 'max_forks'
    | 'max_concurrent_jobs'
    | 'policy_instance_minimum'
    | 'policy_instance_percentage'
  >
>;

export function CreateInstanceGroup() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<InstanceGroupPayload, InstanceGroup>();

  const onSubmit: PageFormSubmitHandler<InstanceGroupPayload> = async (data) => {
    const instanceGroup = await postRequest(awxAPI`/instance_groups/`, data);
    pageNavigate(AwxRoute.InstanceGroupDetails, {
      params: {
        id: instanceGroup.id,
      },
    });
  };
  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create instance group')}
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          { label: t('Create instance group') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create instance group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: '',
          policy_instance_minimum: 0,
          policy_instance_percentage: 0,
          max_concurrent_jobs: 0,
          max_forks: 0,
        }}
      >
        <InstanceGroupInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditInstanceGroup() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const patchRequest = usePatchRequest<InstanceGroupPayload, InstanceGroup>();
  const {
    data: instanceGroup,
    isLoading,
    error,
  } = useGetItem<InstanceGroup>(awxAPI`/instance_groups/`, params?.id?.toString());

  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  if (error) {
    return <AwxError error={error} />;
  }
  if (isLoading || !instanceGroup) {
    return <LoadingPage />;
  }
  const onSubmit: PageFormSubmitHandler<InstanceGroupPayload> = async (data) => {
    const updateInstanceGroup = await patchRequest(
      awxAPI`/instance_groups/${params?.id as string}/`,
      data
    );
    pageNavigate(AwxRoute.InstanceGroupDetails, {
      params: {
        id: updateInstanceGroup.id,
      },
    });
  };
  return (
    <PageLayout>
      <PageHeader
        title={
          instanceGroup?.name
            ? t('Edit {{instancegroupName}}', { instancegroupName: instanceGroup?.name })
            : t('Instance Group')
        }
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          {
            label: instanceGroup?.name
              ? t('Edit {{instancegroupName}}', { instancegroupName: instanceGroup?.name })
              : t('Instance Group'),
          },
        ]}
      />
      <AwxPageForm
        submitText={t('Save instance group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: instanceGroup.name,
          policy_instance_minimum: instanceGroup.policy_instance_minimum || 0,
          policy_instance_percentage: instanceGroup.policy_instance_percentage || 0,
          max_concurrent_jobs: instanceGroup.max_concurrent_jobs || 0,
          max_forks: instanceGroup.max_forks || 0,
        }}
      >
        <InstanceGroupInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function InstanceGroupInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<InstanceGroup>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<InstanceGroup>
        name="policy_instance_minimum"
        type="number"
        labelHelp={t(
          'Minimum number of instances that will be automatically assigned to this group when new instances come online.'
        )}
        min={0}
        label={t('Policy instance minimum')}
      />
      <PageFormTextInput<InstanceGroup>
        name="policy_instance_percentage"
        labelHelp={t(
          'Minimum percentage of all instances that will be automatically assigned to this group when new instances come online.'
        )}
        type="number"
        min={0}
        label={t('Policy instance percentage')}
      />
      <PageFormTextInput<InstanceGroup>
        name="max_concurrent_jobs"
        labelHelp={t(
          'Maximum number of jobs to run concurrently on this group. Zero means no limit will be enforced.'
        )}
        type="number"
        min={0}
        label={t('Max concurrent jobs')}
      />
      <PageFormTextInput<InstanceGroup>
        labelHelp={t(
          'Maximum number of forks to allow across all jobs running concurrently on this group. Zero means no limit will be enforced.'
        )}
        name="max_forks"
        min={0}
        type="number"
        label={t('Max forks')}
      />
    </>
  );
}
