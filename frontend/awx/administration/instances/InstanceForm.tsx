import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  useGetPageUrl,
  PageFormCheckbox,
  usePageNavigate,
} from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { AwxPageForm } from '../../common/AwxPageForm';
import { Instance } from '../../interfaces/Instance';
import { AwxRoute } from '../../main/AwxRoutes';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { requestPatch } from '../../../common/crud/Data';
import { useSWRConfig } from 'swr';
import { useGet } from '../../../common/crud/useGet';

const InstanceType = {
  Execution: 'execution',
  Hop: 'hop',
};

export interface IInstanceInput {
  hostname: string;
  listener_port: number;
  id?: string;
  managed_by_policy: boolean;
  peers_from_control_nodes: boolean;
  enabled: boolean;
  node_state: string;
  node_type: string;
}

export function AddInstance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Instance>();

  const onSubmit: PageFormSubmitHandler<Instance> = async (instanceInput: Instance) => {
    instanceInput.node_state = 'installed';
    instanceInput.listener_port = Number(instanceInput.listener_port);
    const newInstance = await postRequest(awxAPI`/instances/`, instanceInput);
    pageNavigate(AwxRoute.InstanceDetails, { params: { id: newInstance.id } });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <>
      <PageHeader
        title={t('Add instance')}
        breadcrumbs={[
          { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
          { label: t('Add instance') },
        ]}
      />
      <AwxPageForm
        submitText={t('Save')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ node_type: InstanceType.Execution, node_state: 'installed' }}
      >
        <InstanceInputs mode="create" />
      </AwxPageForm>
    </>
  );
}

export function EditInstance() {
  const params = useParams();
  const id = Number(params.id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: instance } = useGet<Instance>(awxAPI`/instances/${id?.toString()}/`);

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Instance> = async (instanceInput: Instance) => {
    instanceInput.listener_port =
      instanceInput.listener_port && Number(instanceInput?.listener_port);
    await requestPatch<Instance>(awxAPI`/instances/${id.toString()}/`, instanceInput);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (instance) {
    return (
      <>
        <PageHeader
          title={t('Edit instance')}
          breadcrumbs={[
            { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
            { label: t('Edit instance') },
          ]}
        />
        <AwxPageForm
          submitText={t('Save')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={getInitialFormValues(instance)}
        >
          <InstanceInputs mode="edit" />
        </AwxPageForm>
      </>
    );
  }
}

function InstanceInputs(props: { mode: 'create' | 'edit' }) {
  const { mode } = props;
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput<IInstanceInput>
        name="hostname"
        label={t('Host name')}
        placeholder={t('Enter a host name')}
        isRequired
        maxLength={150}
        isDisabled={mode === 'edit'}
      />
      <PageFormTextInput<IInstanceInput>
        name="node_state"
        label={t('Instance state')}
        placeholder={t('installed')}
        isDisabled={true}
        labelHelp={t('Sets the current life cycle stage of this instance. Default is "installed."')}
      />
      <PageFormTextInput<IInstanceInput>
        name="listener_port"
        type="number"
        label={t('Listener port')}
        placeholder={t('27199')}
        labelHelp={t(
          'Select the port that Receptor will listen on for incoming connections, e.g. 27199.'
        )}
      />
      <PageFormSelect<IInstanceInput>
        name="node_type"
        label={t('Instance type')}
        placeholderText={t('Select a client type')}
        options={[
          {
            label: t('Execution'),
            value: InstanceType.Execution,
          },
          {
            label: t('Hop'),
            value: InstanceType.Hop,
          },
        ]}
        isRequired
        isDisabled={mode === 'edit'}
      />
      <PageFormSection title={t('Options')} singleColumn>
        <PageFormCheckbox<IInstanceInput>
          name="enabled"
          label={t('Enable instance')}
          labelHelp={t(
            'Set the instance enabled or disabled. If disabled, jobs will not be assigned to this instance.'
          )}
        />
        <PageFormCheckbox<IInstanceInput>
          name="managed_by_policy"
          label={t('Managed by policy')}
          labelHelp={t(
            'Controls whether or not this instance is managed by policy. If enabled, the instance will be available for automatic assignment to and unassignment from instance groups based on policy rules.'
          )}
        />
        <PageFormCheckbox<IInstanceInput>
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

function getInitialFormValues(instance: Instance | undefined) {
  return {
    hostname: instance?.hostname,
    listener_port: instance?.listener_port,
    node_state: instance?.node_state,
    node_type: instance?.node_type,
    peers_from_control_nodes: instance?.peers_from_control_nodes,
    managed_by_policy: instance?.managed_by_policy,
    enabled: instance?.enabled,
    peers: [],
  };
}
