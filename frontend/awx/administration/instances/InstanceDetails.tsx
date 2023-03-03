import { ButtonVariant, DropdownPosition, PageSection, Skeleton } from '@patternfly/react-core';
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BytesCell,
  CapacityCell,
  IPageAction,
  PageActions,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  SinceCell,
} from '../../../../framework';
import { StatusCell } from '../../../common/StatusCell';
import { useItem } from '../../../common/useItem';
import { requestPost } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { Instance } from '../../interfaces/Instance';
import { NodeTypeCell } from './Instances';

export function InstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const instance = useItem<Instance>('/api/v2/instances', params.id ?? '0');
  const history = useNavigate();

  const itemActions: IPageAction<Instance>[] = useMemo(() => {
    const itemActions: IPageAction<Instance>[] = [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: () => history(RouteObj.EditInstance.replace(':id', instance?.id.toString() ?? '')),
      },
      {
        type: PageActionType.button,
        icon: HeartbeatIcon,
        variant: ButtonVariant.secondary,
        label: t('Run health check'),
        onClick: () => {
          requestPost(`/api/v2/instances/${instance?.id ?? 0}/health_check/`, {}).catch(
            // eslint-disable-next-line no-console
            console.error
          );
        },
      },
    ];
    return itemActions;
  }, [t, history, instance]);

  return (
    <PageLayout>
      <PageHeader
        title={instance?.hostname}
        breadcrumbs={[
          { label: t('Instances'), to: RouteObj.Instances },
          { label: instance?.hostname },
        ]}
        headerActions={
          <PageActions<Instance> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      {instance ? (
        <InstanceDetailsTab instance={instance} />
      ) : (
        <PageSection variant="light">
          <Skeleton />
        </PageSection>
      )}
    </PageLayout>
  );
}

function InstanceDetailsTab(props: { instance: Instance }) {
  const { t } = useTranslation();
  const { instance } = props;
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{instance.hostname}</PageDetail>
      <PageDetail label={t('Node type')}>
        <NodeTypeCell node_type={instance.node_type} />
      </PageDetail>
      <PageDetail label={t('Status')}>
        <StatusCell
          status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'}
        />
      </PageDetail>
      <PageDetail label={t('Used capacity')}>
        <CapacityCell used={instance.consumed_capacity} capacity={instance.capacity} />
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
        <SinceCell value={instance.last_health_check} />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <SinceCell value={instance.created} />
      </PageDetail>
      <PageDetail label={t('Modified')}>
        <SinceCell value={instance.modified} />
      </PageDetail>
    </PageDetails>
  );
}
