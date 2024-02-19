import {
  Button,
  ButtonVariant,
  Label,
  PageSection,
  Progress,
  Skeleton,
  Slider,
  SliderOnChangeEvent,
  Switch,
  Tooltip,
} from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { DownloadIcon, HeartbeatIcon, PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  BytesCell,
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { Dotted } from '../../../../framework/components/Dotted';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusLabel } from '../../../common/Status';
import { useGet, useGetItem } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxRoute } from '../../main/AwxRoutes';
import { useInstanceActions } from './hooks/useInstanceActions';
import { useNodeTypeTooltip } from './hooks/useNodeTypeTooltip';
import { Settings } from '../../interfaces/Settings';

export function InstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: instance, refresh } = useGetItem<Instance>(awxAPI`/instances`, params.id);
  const { instanceGroups, instanceForks, handleToggleInstance, handleInstanceForksSlider } =
    useInstanceActions(params.id as string);
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest();
  const activeUser = useAwxActiveUser();
  const { data } = useGet<Settings>(awxAPI`/settings/system/`);
  const instancesType = instance?.node_type === 'execution' || instance?.node_type === 'hop';
  const userAccess = activeUser?.is_superuser || activeUser?.is_system_auditor;
  const isK8s = data?.IS_K8S;
  const canAddAndEditInstances = instancesType && isK8s && userAccess;

  const itemActions: IPageAction<Instance>[] = useMemo(() => {
    const itemActions: IPageAction<Instance>[] = [
      {
        type: PageActionType.Button,
        isHidden: () => isK8s === false || !instancesType,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit instance'),
        onClick: () => pageNavigate(AwxRoute.EditInstance, { params: { id: params.id } }),
        isDisabled: canAddAndEditInstances
          ? undefined
          : t(
              'You do not have permission to edit instances. Please contact your organization administrator if there is an issue with your access.'
            ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HeartbeatIcon,
        variant: ButtonVariant.secondary,
        isPinned: true,
        label: t('Run health check'),
        onClick: () => {
          void postRequest(awxAPI`/instances/${instance?.id.toString() ?? ''}/health_check/`, {});
        },
      },
    ];
    return itemActions;
  }, [
    t,
    pageNavigate,
    postRequest,
    instance?.id,
    canAddAndEditInstances,
    isK8s,
    params.id,
    instancesType,
  ]);

  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={instance?.hostname}
        breadcrumbs={[
          { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
          { label: instance?.hostname },
        ]}
        headerActions={
          <PageActions<Instance> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      {instance ? (
        <InstanceDetailsTab
          instance={instance}
          instanceGroups={instanceGroups}
          handleToggleInstance={handleToggleInstance}
          instanceForks={instanceForks}
          handleInstanceForksSlider={handleInstanceForksSlider}
        />
      ) : (
        <PageSection variant="light">
          <Skeleton />
        </PageSection>
      )}
    </PageLayout>
  );
}

export function InstanceDetailsTab(props: {
  instance: Instance;
  instanceGroups: AwxItemsResponse<InstanceGroup> | undefined;
  instanceForks: number;
  handleToggleInstance: (instance: Instance, isEnabled: boolean) => Promise<void>;
  handleInstanceForksSlider: (instance: Instance, value: number) => Promise<void>;
  numberOfColumns?: 'multiple' | 'single' | undefined;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const activeUser = useAwxActiveUser();
  const {
    instance,
    instanceGroups,
    handleToggleInstance,
    instanceForks,
    handleInstanceForksSlider,
  } = props;
  const toolTipMap: { [item: string]: string } = useNodeTypeTooltip();
  const capacityAvailable = instance.cpu_capacity !== 0 && instance.mem_capacity !== 0;
  return (
    <PageDetails numberOfColumns={props.numberOfColumns}>
      <PageDetail label={t('Name')} data-cy="name">
        <Button
          variant="link"
          isInline
          onClick={() =>
            pageNavigate(AwxRoute.InstanceDetails, {
              params: { id: instance.id },
            })
          }
        >
          {instance.hostname}
        </Button>
      </PageDetail>
      <PageDetail label={t('Node type')} data-cy="node-type">
        <Tooltip content={toolTipMap[instance.node_type]}>
          <Dotted>{`${capitalizeFirstLetter(instance.node_type)}`}</Dotted>
        </Tooltip>
      </PageDetail>
      <PageDetail label={t('Status')} data-cy="node-status">
        <StatusLabel dataCy="node-label-status" status={instance.node_state} />
      </PageDetail>
      {instanceGroups && instanceGroups.results.length > 0 && (
        <PageDetail label={t(`Instance groups`)} data-cy="instance-groups">
          {instanceGroups.results.map((instance) => (
            <Label color="blue" style={{ marginRight: '10px' }} key={instance.id}>
              <Link to={getPageUrl(AwxRoute.InstanceGroupDetails, { params: { id: instance.id } })}>
                {/* eslint-disable-next-line i18next/no-literal-string */}
                {instance.name}
              </Link>
            </Label>
          ))}
        </PageDetail>
      )}
      {instance.related?.install_bundle && (
        <PageDetail label={t`Download bundle`} data-cy="download-bundle">
          <Button
            size="sm"
            aria-label={t`Download Bundle`}
            component="a"
            download={`${instance.related?.install_bundle}`}
            href={`${instance.related?.install_bundle}`}
            target="_blank"
            variant="secondary"
            rel="noopener noreferrer"
          >
            <DownloadIcon />
          </Button>
        </PageDetail>
      )}
      {instance.listener_port && (
        <PageDetail label={t`Listener port`} data-cy="listener-port">
          {instance.listener_port}
        </PageDetail>
      )}
      <PageDetail label={t('Used capacity')} data-cy="used-capacity">
        <Progress value={Math.round(100 - instance.percent_capacity_remaining)} />
      </PageDetail>
      <PageDetail label={t('Running jobs')} data-cy="running-jobs">
        {instance.jobs_running.toString()}
      </PageDetail>
      <PageDetail label={t('Total jobs')} data-cy="total-jobs">
        {instance.jobs_total.toString()}
      </PageDetail>
      <PageDetail label={t('Policy type')} data-cy="policy-type">
        {instance.managed_by_policy ? t('Auto') : t('Manual')}
      </PageDetail>
      <PageDetail label={t('Memory')} data-cy="memory">
        <BytesCell bytes={instance.memory} />
      </PageDetail>
      <PageDetail label={t('Last health check')} data-cy="last-health-check">
        {formatDateString(instance.last_health_check)}
      </PageDetail>
      <PageDetail label={t('Created')} data-cy="created">
        {formatDateString(instance.created)}
      </PageDetail>
      <LastModifiedPageDetail value={instance.modified} data-cy="modified" />
      <PageDetail label={t('Forks')} data-cy="forks">
        <div>
          {t('Total forks: ')}
          {instanceForks}
        </div>
        <Slider
          areCustomStepsContinuous
          max={instance.mem_capacity}
          min={instance.cpu_capacity}
          value={instanceForks}
          onChange={(_event: SliderOnChangeEvent, value: number) =>
            void handleInstanceForksSlider(instance, value)
          }
          isDisabled={!activeUser?.is_superuser || !instance.enabled || !capacityAvailable}
        />
      </PageDetail>
      <PageDetail label={t('Enabled')} data-cy="enabled">
        <Switch
          id="enable-instance"
          isDisabled={!activeUser?.is_superuser}
          label={t('Enabled')}
          labelOff={t('Disabled')}
          isChecked={instance.enabled}
          onChange={() => {
            void handleToggleInstance(instance, !instance.enabled);
          }}
        />
      </PageDetail>
    </PageDetails>
  );
}
