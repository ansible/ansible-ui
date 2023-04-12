import { ButtonVariant, DropdownPosition, PageSection, Skeleton } from '@patternfly/react-core';
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BytesCell,
  CapacityCell,
  DateTimeCell,
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { useGetItem } from '../../../common/crud/useGetItem';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxError } from '../../common/AwxError';
import { Instance } from '../../interfaces/Instance';
import { NodeTypeCell } from './Instances';

export function InstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: instance, refresh } = useGetItem<Instance>('/api/v2/instances', params.id);
  const history = useNavigate();
  const postRequest = usePostRequest();
  const itemActions: IPageAction<Instance>[] = useMemo(() => {
    const itemActions: IPageAction<Instance>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: (instance) =>
          history(RouteObj.EditInstance.replace(':id', instance?.id.toString() ?? '')),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: HeartbeatIcon,
        variant: ButtonVariant.secondary,
        label: t('Run health check'),
        onClick: () => {
          void postRequest(`/api/v2/instances/${instance?.id ?? 0}/health_check/`, {});
        },
      },
    ];
    return itemActions;
  }, [t, history, postRequest, instance?.id]);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;

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
        <DateTimeCell format="since" value={instance.last_health_check} />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell format="since" value={instance.created} />
      </PageDetail>
      <PageDetail label={t('Modified')}>
        <DateTimeCell format="since" value={instance.modified} />
      </PageDetail>
    </PageDetails>
  );
}
