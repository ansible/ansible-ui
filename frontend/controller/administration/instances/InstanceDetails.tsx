import { ButtonVariant, DropdownPosition, PageSection } from '@patternfly/react-core';
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BytesCell,
  CapacityCell,
  Detail,
  DetailsList,
  DetailsSkeleton,
  IPageAction,
  PageActions,
  PageActionType,
  PageHeader,
  PageLayout,
  SinceCell,
} from '../../../../framework';
import { Scrollable } from '../../../../framework/components/Scrollable';
import { useSettings } from '../../../../framework/Settings';
import { StatusCell } from '../../../common/StatusCell';
import { useItem } from '../../../common/useItem';
import { requestPost } from '../../../Data';
import { RouteE } from '../../../Routes';
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
        onClick: () => history(RouteE.EditInstance.replace(':id', instance?.id.toString() ?? '')),
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
          { label: t('Instances'), to: RouteE.Instances },
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
          <DetailsSkeleton />
        </PageSection>
      )}
    </PageLayout>
  );
}

function InstanceDetailsTab(props: { instance: Instance }) {
  const { t } = useTranslation();
  const { instance } = props;
  // const history = useNavigate()
  const settings = useSettings();
  return (
    <>
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <DetailsList>
            <Detail label={t('Name')}>{instance.hostname}</Detail>
            <Detail label={t('Node type')}>
              <NodeTypeCell node_type={instance.node_type} />
            </Detail>
            <Detail label={t('Status')}>
              <StatusCell
                status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'}
              />
            </Detail>
            <Detail label={t('Used capacity')}>
              <CapacityCell used={instance.consumed_capacity} capacity={instance.capacity} />
            </Detail>
            <Detail label={t('Running jobs')}>{instance.jobs_running.toString()}</Detail>
            <Detail label={t('Total jobs')}>{instance.jobs_total.toString()}</Detail>
            <Detail label={t('Policy type')}>
              {instance.managed_by_policy ? t('Auto') : t('Manual')}
            </Detail>
            <Detail label={t('Memory')}>
              <BytesCell bytes={instance.memory} />
            </Detail>
            <Detail label={t('Last health check')}>
              <SinceCell value={instance.last_health_check} />
            </Detail>
            <Detail label={t('Created')}>
              <SinceCell value={instance.created} />
            </Detail>
            <Detail label={t('Modified')}>
              <SinceCell value={instance.modified} />
            </Detail>
          </DetailsList>
        </PageSection>
      </Scrollable>
    </>
  );
}
