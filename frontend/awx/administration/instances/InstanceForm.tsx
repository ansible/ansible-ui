import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageFormCheckbox,
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance } from '../../interfaces/Instance';
import { AwxRoute } from '../../main/AwxRoutes';
import { useWatch } from 'react-hook-form';

export function AddInstance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Instance>();

  const onSubmit: PageFormSubmitHandler<Instance> = async (instance: Instance) => {
    const newInstance = await postRequest(awxAPI`/instances/`, instance);
    pageNavigate(AwxRoute.InstanceDetails, { params: { id: newInstance.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create instance')}
        breadcrumbs={[
          { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
          { label: t('Create instance') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create instance')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          node_type: 'execution',
          node_state: 'installed',
          enabled: true,
          peers_from_control_nodes: false,
          managed_by_policy: true,
        }}
      >
        <InstanceInputs mode="create" />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditInstance() {
  const params = useParams();
  const id = Number(params.id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { data: instance } = useGet<Instance>(awxAPI`/instances/${id?.toString()}/`);

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Instance> = async (instanceInput: Instance) => {
    instanceInput.listener_port =
      instanceInput.listener_port && Number(instanceInput?.listener_port);
    await requestPatch<Instance>(awxAPI`/instances/${id.toString()}/`, instanceInput);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(AwxRoute.InstanceDetails, { params: { id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (instance) {
    return (
      <PageLayout>
        <PageHeader
          title={
            instance?.hostname
              ? t('Edit {{instanceName}}', { instanceName: instance?.hostname })
              : t('Instances')
          }
          breadcrumbs={[
            { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
            {
              label: instance?.hostname
                ? t('Edit {{instanceName}}', { instanceName: instance?.hostname })
                : t('Instances'),
            },
          ]}
        />
        <AwxPageForm
          submitText={t('Save instance')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={instance}
        >
          <InstanceInputs mode="edit" />
        </AwxPageForm>
      </PageLayout>
    );
  }
}

function InstanceInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();
  const peersFromControlNodes = useWatch({ name: 'peers_from_control_nodes' }) as boolean;
  return (
    <>
      <PageFormTextInput<Instance>
        name="hostname"
        label={t('Host name')}
        placeholder={t('Enter a host name')}
        isRequired
        maxLength={150}
        isDisabled={mode === 'edit'}
      />
      <PageFormTextInput<Instance>
        name="node_state"
        label={t('Instance state')}
        placeholder={t('installed')}
        isDisabled={true}
        labelHelp={t('Sets the current life cycle stage of this instance. Default is "installed."')}
      />
      <PageFormTextInput<Instance>
        name="listener_port"
        type="number"
        label={t('Listener port')}
        placeholder={t('Enter a listener port')}
        isRequired={peersFromControlNodes}
        min={0}
        max={65353}
        labelHelp={t(
          'Select the port that Receptor will listen on for incoming connections, e.g. 27199.'
        )}
      />
      <PageFormSelect<Instance>
        name="node_type"
        label={t('Instance type')}
        placeholderText={t('Select a client type')}
        options={[
          {
            label: t('Execution'),
            value: 'execution',
          },
          {
            label: t('Hop'),
            value: 'hop',
          },
        ]}
        isRequired
        isDisabled={mode === 'edit'}
      />
      <PageFormSection title={t('Options')} singleColumn>
        <PageFormCheckbox<Instance>
          name="enabled"
          label={t('Enable instance')}
          labelHelp={t(
            'Set the instance enabled or disabled. If disabled, jobs will not be assigned to this instance.'
          )}
        />
        <PageFormCheckbox<Instance>
          name="managed_by_policy"
          label={t('Managed by policy')}
          labelHelp={t(
            'Controls whether or not this instance is managed by policy. If enabled, the instance will be available for automatic assignment to and unassignment from instance groups based on policy rules.'
          )}
        />
        <PageFormCheckbox<Instance>
          name="peers_from_control_nodes"
          label={t('Peers from control nodes')}
          labelHelp={t(
            'If enabled, control nodes will peer to this instance automatically. If disabled, instance will be connected only to associated peers.'
          )}
        />
      </PageFormSection>
    </>
  );
}
