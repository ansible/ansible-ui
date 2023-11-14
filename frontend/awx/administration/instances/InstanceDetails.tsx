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
import { DownloadIcon, EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { StatusLabel } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { Instance } from '../../interfaces/Instance';

import { Dotted } from '../../../../framework/components/Dotted';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { AwxRoute } from '../../AwxRoutes';
import { awxAPI } from '../../api/awx-utils';
import { useNodeTypeTooltip } from './hooks/useNodeTypeTooltip';
import { RouteObj } from '../../../common/Routes';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { useInstanceActions } from './hooks/useInstanceActions';

export function InstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: instance, refresh } = useGetItem<Instance>(awxAPI`/instances`, params.id);
  const { instanceGroups, instanceForks, handleToggleInstance, handleInstanceForksSlider } =
    useInstanceActions(params.id as string);
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest();
  const itemActions: IPageAction<Instance>[] = useMemo(() => {
    const itemActions: IPageAction<Instance>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: (instance) => pageNavigate(AwxRoute.EditInstance, { params: { id: instance.id } }),
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
  }, [t, pageNavigate, postRequest, instance?.id]);

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
}) {
  const { t } = useTranslation();
  const history = useNavigate();
  const getPageUrl = useGetPageUrl();
  const {
    instance,
    instanceGroups,
    handleToggleInstance,
    instanceForks,
    handleInstanceForksSlider,
  } = props;
  const toolTipMap: { [item: string]: string } = useNodeTypeTooltip();
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>
        <Button
          variant="link"
          isInline
          onClick={() =>
            history(
              getPageUrl(AwxRoute.InstancePage, {
                params: { id: instance.id },
              })
            )
          }
        >
          {instance.hostname}
        </Button>
      </PageDetail>
      <PageDetail label={t('Node type')}>
        <Tooltip content={toolTipMap[instance.node_type]}>
          <Dotted>{`${capitalizeFirstLetter(instance.node_type)}`}</Dotted>
        </Tooltip>
      </PageDetail>
      <PageDetail label={t('Status')}>
        <StatusLabel status={instance.node_state} />
      </PageDetail>
      {instanceGroups && (
        <PageDetail label={t(`Instance groups`)}>
          {instanceGroups.results.map((instance) => (
            <Label color="blue" style={{ marginRight: '10px' }} key={instance.id}>
              <Link to={RouteObj.InstanceGroupDetails.replace(':id', instance.id.toString())}>
                {/* eslint-disable-next-line i18next/no-literal-string */}
                {instance.name}
              </Link>
            </Label>
          ))}
        </PageDetail>
      )}
      {instance.related?.install_bundle && (
        <PageDetail label={t`Download bundle`}>
          <Button
            size="sm"
            aria-label={t`Download Bundle`}
            component="a"
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
        <PageDetail label={t`Listener port`}>{instance.listener_port}</PageDetail>
      )}
      <PageDetail label={t('Used capacity')}>
        <Progress value={Math.round(100 - instance.percent_capacity_remaining)} />
      </PageDetail>
      <PageDetail label={t('Running jobs')}>{instance.jobs_running.toString()}</PageDetail>
      <PageDetail label={t('Total jobs')}>{instance.jobs_total.toString()}</PageDetail>
      <PageDetail label={t('Policy type')}>
        {instance.managed_by_policy ? t('Auto') : t('Manual')}
      </PageDetail>
      <PageDetail label={t('Memory')}>
        <BytesCell bytes={instance.memory} />
      </PageDetail>
      <PageDetail label={t('Last health check')}>
        {formatDateString(instance.last_health_check)}
      </PageDetail>
      <PageDetail label={t('Created')}>{formatDateString(instance.created)}</PageDetail>
      <PageDetail label={t('Modified')}>{formatDateString(instance.modified)}</PageDetail>
      <PageDetail label={t('Forks')}>
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
          isDisabled={
            // need to add rbac for super user
            !instance.enabled
          }
        />
      </PageDetail>
      <PageDetail label={t('Enabled')}>
        <Switch
          id="enable-instance"
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
