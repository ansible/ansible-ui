import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxPageForm } from '../../common/AwxPageForm';
import { InstanceGroup as ContainerGroup } from '../../interfaces/InstanceGroup';
import { awxAPI } from '../../common/api/awx-utils';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useGetItem } from '../../../common/crud/useGet';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { SummaryFieldCredential } from '../../interfaces/summary-fields/summary-fields';
import { POD_SPEC_DEFAULT_VALUE } from './constants';
import { useEffect } from 'react';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';

type ContainerGroupForm = {
  credential: SummaryFieldCredential | null;
  name: string;
  max_forks: number;
  max_concurrent_jobs: number;
  override: boolean;
  pod_spec_override: string;
};
type ContainerFormPayload = Omit<ContainerGroupForm, 'override' | 'credential'> & {
  credential?: number;
  is_container_group: true;
};
export function CreateContainerGroup() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<ContainerFormPayload, ContainerGroup>();

  const onSubmit: PageFormSubmitHandler<ContainerGroupForm> = async (data) => {
    const { override, pod_spec_override, credential, ...rest } = data;
    const podSpecForSubmit = override ? pod_spec_override : '';
    const containerGroup = await postRequest(awxAPI`/instance_groups/`, {
      ...rest,
      credential: credential?.id,
      pod_spec_override: podSpecForSubmit,
      is_container_group: true,
    });
    pageNavigate(AwxRoute.ContainerGroupDetails, { params: { id: containerGroup.id } });
  };
  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Container Group')}
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          { label: t('Create Container Group') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create Container Group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: '',
          override: false,
          credential: null,
          pod_spec_override: POD_SPEC_DEFAULT_VALUE,
          max_concurrent_jobs: 0,
          max_forks: 0,
        }}
      >
        <ContainerGroupInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditContainerGroup() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const patchRequest = usePatchRequest<ContainerFormPayload, ContainerGroup>();
  const {
    data: containerGroup,
    isLoading,
    error,
  } = useGetItem<ContainerGroup>(awxAPI`/instance_groups/`, params?.id?.toString());

  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  if (error) {
    return <AwxError error={error} />;
  }
  if (isLoading || !containerGroup) {
    return <LoadingPage />;
  }
  const onSubmit: PageFormSubmitHandler<ContainerGroupForm> = async (data) => {
    const { override, pod_spec_override, credential, ...rest } = data;

    const podSpecForSubmit = override ? pod_spec_override : '';
    const updateContainerGroup = await patchRequest(
      awxAPI`/instance_groups/${params?.id as string}/`,
      {
        ...rest,
        pod_spec_override: podSpecForSubmit,
        credential: credential?.id,
        is_container_group: true,
      }
    );
    pageNavigate(AwxRoute.ContainerGroupDetails, { params: { id: updateContainerGroup.id } });
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Container Group')}
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          { label: t('Edit Container Group') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save Container Group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: containerGroup.name,
          max_concurrent_jobs: containerGroup.max_concurrent_jobs || 0,
          max_forks: containerGroup.max_forks || 0,
          pod_spec_override: containerGroup.pod_spec_override || POD_SPEC_DEFAULT_VALUE,
          override: Boolean(containerGroup.pod_spec_override),
        }}
      >
        <ContainerGroupInputs pod_spec_initialValue={containerGroup.pod_spec_override} />
      </AwxPageForm>
    </PageLayout>
  );
}

export function ContainerGroupInputs(props: { pod_spec_initialValue?: string }) {
  const { t } = useTranslation();
  const { pod_spec_initialValue } = props;
  const hasOverride = useWatch({ name: 'override' }) as boolean;
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!hasOverride) {
      setValue(
        'pod_spec_override',
        pod_spec_initialValue?.trim().length ? pod_spec_initialValue : POD_SPEC_DEFAULT_VALUE
      );
    }
  }, [setValue, hasOverride, pod_spec_initialValue]);
  return (
    <>
      <PageFormTextInput<ContainerGroupForm>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormCredentialSelect<ContainerGroupForm>
        name="credential.name"
        credentialIdPath="credential.id"
        credentialType={17}
        label={t('Credential')}
      />

      <PageFormTextInput<ContainerGroupForm>
        name="max_concurrent_jobs"
        type="number"
        label={t('Max concurrent jobs')}
      />
      <PageFormTextInput<ContainerGroupForm>
        name="max_forks"
        type="number"
        label={t('Max forks')}
      />
      <PageFormCheckbox<{ override: boolean }> label={t('Cutomize pod spec')} name="override" />
      {hasOverride && (
        <PageFormHidden hidden={(hasOverride) => !hasOverride} watch="override">
          <PageFormSection singleColumn>
            <PageFormDataEditor<ContainerGroupForm>
              format="yaml"
              label={t('Pod spec override')}
              name="pod_spec_override"
            />
          </PageFormSection>
        </PageFormHidden>
      )}
    </>
  );
}
