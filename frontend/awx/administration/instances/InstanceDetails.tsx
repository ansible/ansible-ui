import { Button, Label, PageSection, Progress, Skeleton, Tooltip } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  BytesCell,
  PageDetail,
  PageDetails,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { Dotted } from '../../../../framework/components/Dotted';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance } from '../../interfaces/Instance';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { AwxRoute } from '../../main/AwxRoutes';
import { useInstanceActions } from './hooks/useInstanceActions';
import { useNodeTypeTooltip } from './hooks/useNodeTypeTooltip';
import { InstanceForksSlider } from './components/InstanceForksSlider';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';

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
  numberOfColumns?: 'multiple' | 'single' | undefined;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const { instance, instanceGroups, instanceForks } = props;
  const toolTipMap: { [item: string]: string } = useNodeTypeTooltip();

  return (
    <PageDetails numberOfColumns={props.numberOfColumns} disableScroll>
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
        <StatusCell status={instance.health_check_pending ? 'running' : instance.node_state} />
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
      {!instance.managed && instance.related?.install_bundle && (
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
        {instance.enabled ? (
          <Progress value={Math.round(100 - instance.percent_capacity_remaining)} />
        ) : (
          t('Unavailable')
        )}
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
      {instance.node_type !== 'hop' ? (
        <PageDetail label={t('Forks')} data-cy="forks">
          {instanceForks > 0 ? <InstanceForksSlider instance={instance} /> : undefined}
        </PageDetail>
      ) : undefined}
      <PageDetailCodeEditor
        value={instance.errors}
        label={t('Errors')}
        isEmpty={instance.errors === ''}
        fullWidth={true}
      />
    </PageDetails>
  );
}
