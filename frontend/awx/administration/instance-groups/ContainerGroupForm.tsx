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
import { useWatch } from 'react-hook-form';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { jsonToYaml } from '../../../../framework/utils/codeEditorUtils';

type ContainerGroupForm = {
  credential: number | null;
  name: string;
  max_forks: number;
  max_concurrent_jobs: number;
  override: boolean;
  pod_spec_override: string;
};
type ContainerFormPayload = Omit<ContainerGroupForm, 'override'> & {
  is_container_group: true;
};
export function CreateContainerGroup() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<ContainerFormPayload, ContainerGroup>();
  const { data, error, isLoading } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/instance_groups/`
  );

  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  const onSubmit: PageFormSubmitHandler<ContainerGroupForm> = async (data) => {
    const { override, pod_spec_override, ...rest } = data;
    const podSpecForSubmit = override ? pod_spec_override : '';
    const containerGroup = await postRequest(awxAPI`/instance_groups/`, {
      ...rest,
      pod_spec_override: podSpecForSubmit,
      is_container_group: true,
    });
    pageNavigate(AwxRoute.InstanceGroupDetails, {
      params: { id: containerGroup.id },
    });
  };
  if (isLoading) {
    return <LoadingPage />;
  }
  if (error) {
    return <AwxError error={error} />;
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Create container group')}
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          { label: t('Create container group') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create container group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: '',
          override: false,
          credential: null,
          pod_spec_override: jsonToYaml(
            JSON.stringify(data?.actions?.POST?.pod_spec_override.default)
          ),
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
    error: igError,
  } = useGetItem<ContainerGroup>(awxAPI`/instance_groups/`, params?.id?.toString());

  const {
    data,
    error: optionsError,
    isLoading: optionsLoading,
  } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/instance_groups/`);
  const onCancel = () => {
    pageNavigate(AwxRoute.InstanceGroups);
  };
  const error = igError || optionsError;
  if (error) {
    return <AwxError error={error} />;
  }
  if (isLoading || !containerGroup || optionsLoading) {
    return <LoadingPage />;
  }
  const onSubmit: PageFormSubmitHandler<ContainerGroupForm> = async (data) => {
    const { override, pod_spec_override, ...rest } = data;

    const podSpecForSubmit = override ? pod_spec_override : '';
    const updateContainerGroup = await patchRequest(
      awxAPI`/instance_groups/${params?.id as string}/`,
      {
        ...rest,
        pod_spec_override: podSpecForSubmit,
        is_container_group: true,
      }
    );
    pageNavigate(AwxRoute.InstanceGroupDetails, {
      params: { id: updateContainerGroup.id },
    });
  };
  return (
    <PageLayout>
      <PageHeader
        title={
          containerGroup?.name
            ? t('Edit {{containergroupName}}', { containergroupName: containerGroup?.name })
            : t('Container Group')
        }
        breadcrumbs={[
          { label: t('Instance Groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          {
            label: containerGroup?.name
              ? t('Edit {{containergroupName}}', { containergroupName: containerGroup?.name })
              : t('Container Group'),
          },
        ]}
      />
      <AwxPageForm
        submitText={t('Save container group')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: containerGroup.name,
          credential: containerGroup.credential ?? null,
          max_concurrent_jobs: containerGroup.max_concurrent_jobs || 0,
          max_forks: containerGroup.max_forks || 0,
          pod_spec_override: containerGroup?.pod_spec_override.length
            ? containerGroup?.pod_spec_override
            : jsonToYaml(JSON.stringify(data?.actions?.POST.pod_spec_override.default)),
          override: Boolean(containerGroup.pod_spec_override),
        }}
      >
        <ContainerGroupInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function ContainerGroupInputs() {
  const { t } = useTranslation();

  const hasOverride = useWatch({ name: 'override' }) as boolean;

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
        name="credential"
        label={t('Credential')}
        labelHelp={t(
          `Credential to authenticate with Kubernetes or OpenShift. Must be of type "Kubernetes/OpenShift API Bearer Token". If left blank, the underlying Pod's service account will be used.`
        )}
        queryParams={{
          credential_type__kind: 'kubernetes',
        }}
      />
      <PageFormTextInput<ContainerGroupForm>
        name="max_concurrent_jobs"
        helperText={t(
          'Maximum number of jobs to run concurrently on this group. Zero means no limit will be enforced.'
        )}
        type="number"
        min={0}
        label={t('Max concurrent jobs')}
      />
      <PageFormTextInput<ContainerGroupForm>
        name="max_forks"
        helperText={t(
          'Maximum number of forks to allow across all jobs running concurrently on this group. Zero means no limit will be enforced.'
        )}
        type="number"
        min={0}
        label={t('Max forks')}
      />
      <PageFormCheckbox<{ override: boolean }> label={t('Customize pod spec')} name="override" />
      {hasOverride && (
        <PageFormHidden hidden={(hasOverride) => !hasOverride} watch="override">
          <PageFormSection singleColumn>
            <PageFormDataEditor<ContainerGroupForm>
              format="yaml"
              helperText={t(
                'Field for passing a custom Kubernetes or OpenShift Pod specification.'
              )}
              label={t('Pod spec override')}
              name="pod_spec_override"
            />
          </PageFormSection>
        </PageFormHidden>
      )}
    </>
  );
}
