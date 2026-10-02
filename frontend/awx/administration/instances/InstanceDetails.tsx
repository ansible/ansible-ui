import {
  BytesCell,
  PageDetail,
  PageDetails,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { Dotted } from '@ansible/ansible-ui-framework/components/Dotted';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { Unavailable } from '@ansible/ansible-ui-framework/components/Unavailable';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { capitalizeFirstLetter } from '@ansible/ansible-ui-framework/utils/strings';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { StatusCell } from '@ansible/common-ui/Status';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Button, Label, PageSection, Progress, Skeleton, Tooltip } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxRoute } from '../../main/AwxRoutes';
import { InstanceForksSlider } from './components/InstanceForksSlider';
import { InstanceSwitch } from './components/InstanceSwitch';
import { useInstanceActions } from './hooks/useInstanceActions';
import { useNodeTypeTooltip } from './hooks/useNodeTypeTooltip';

export function InstanceDetails() {
  const params = useParams<{ id?: string; instance_id?: string }>();
  const { id, instance_id } = params;
  const {
    error,
    data: instance,
    refresh,
  } = useGetItem<Instance>(awxAPI`/instances`, instance_id ?? id);
  const { instanceGroups, instanceForks } = useInstanceActions(instance_id ?? (id as string));
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!instance) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      {instance ? (
        <InstanceDetailsTab
          instance={instance}
          instanceGroups={instanceGroups}
          instanceForks={instanceForks}
        />
      ) : (
        <PageSection hasBodyWrapper={false}>
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
  numberOfColumns?: 'multiple' | 'single' | undefined;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const { instance, instanceGroups, instanceForks } = props;
  const toolTipMap: { [item: string]: string } = useNodeTypeTooltip();

  return (
    <PageDetails numberOfColumns={props.numberOfColumns} disableScroll>
      <PageDetail label={t('Name')} data-cy="name" data-testid="name">
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
      <PageDetail label={t('Node type')} data-cy="node-type" data-testid="node-type">
        <Tooltip content={toolTipMap[instance.node_type]}>
          <Dotted>{`${capitalizeFirstLetter(instance.node_type)}`}</Dotted>
        </Tooltip>
      </PageDetail>
      <PageDetail label={t('Status')} data-cy="node-status" data-testid="node-status">
        <StatusCell status={instance.health_check_pending ? 'running' : instance.node_state} />
      </PageDetail>
      {instanceGroups && instanceGroups.results.length > 0 && (
        <PageDetail
          label={t(`Instance groups`)}
          data-cy="instance-groups"
          data-testid="instance-groups"
        >
          {instanceGroups.results.map((instance) => (
            <Label
              isClickable
              color="blue"
              style={{ marginRight: '10px' }}
              key={instance.id}
              render={({ content, className }) => (
                <Link
                  className={className}
                  to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                    params: { id: instance.id },
                  })}
                >
                  {content}
                </Link>
              )}
            >
              {instance.name}
            </Label>
          ))}
        </PageDetail>
      )}
      {!instance.managed && instance.related?.install_bundle && (
        <PageDetail
          label={t`Download bundle`}
          data-cy="download-bundle"
          data-testid="download-bundle"
        >
          <Button
            icon={<DownloadIcon />}
            size="sm"
            aria-label={t`Download Bundle`}
            component="a"
            download={`${instance.related?.install_bundle}`}
            href={`${instance.related?.install_bundle}`}
            target="_blank"
            variant="secondary"
            rel="noopener noreferrer"
          ></Button>
        </PageDetail>
      )}
      {instance.listener_port ? (
        <PageDetail label={t`Listener port`} data-cy="listener-port" data-testid="listener-port">
          {instance.listener_port}
        </PageDetail>
      ) : null}
      <PageDetail
        label={t('Used capacity')}
        data-cy="used-capacity"
        data-testid="used-capacity"
        isEmpty={instance.node_type === 'hop' || instance.capacity === 0}
      >
        {instance.enabled ? (
          <Progress
            value={Math.round(100 - instance.percent_capacity_remaining)}
            aria-label={t('used capacity')}
          />
        ) : (
          <Unavailable>{t('Unavailable')}</Unavailable>
        )}
      </PageDetail>
      <PageDetail label={t('Running jobs')} data-cy="running-jobs" data-testid="running-jobs">
        {instance.jobs_running.toString()}
      </PageDetail>
      <PageDetail label={t('Total jobs')} data-cy="total-jobs" data-testid="total-jobs">
        {instance.jobs_total.toString()}
      </PageDetail>
      <PageDetail label={t('Policy type')} data-cy="policy-type" data-testid="policy-type">
        {instance.managed_by_policy ? t('Auto') : t('Manual')}
      </PageDetail>
      <PageDetail label={t('Memory')} data-cy="memory" data-testid="memory">
        <BytesCell bytes={instance.memory} />
      </PageDetail>
      <PageDetail
        label={t('Last health check')}
        data-cy="last-health-check"
        data-testid="last-health-check"
      >
        {formatDateString(instance.last_health_check)}
      </PageDetail>
      <PageDetail label={t('Created')} data-cy="created" data-testid="created">
        {formatDateString(instance.created)}
      </PageDetail>
      <LastModifiedPageDetail value={instance.modified} data-cy="modified" data-testid="modified" />
      <PageDetail
        label={t('Forks')}
        data-cy="forks"
        data-testid="forks"
        isEmpty={instance.node_type === 'hop' || instanceForks <= 0}
      >
        <InstanceForksSlider instance={instance} />
      </PageDetail>
      <PageDetail label={t('Enabled')} data-cy="enabled" data-testid="enabled">
        <InstanceSwitch instance={instance} />
      </PageDetail>
      <PageDetailCodeEditor
        value={instance.errors}
        label={t('Errors')}
        isEmpty={instance.errors === ''}
        fullWidth={true}
      />
    </PageDetails>
  );
}
