import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageDetail, PageDetails } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { RouteObj } from '../../../Routes';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { getLaunchedByDetails, getScheduleUrl } from './jobUtils';

export function JobExpanded(job: UnifiedJob) {
  const { value: launchedByValue, link: launchedByLink } = useMemo(
    () => getLaunchedByDetails(job) ?? {},
    [job]
  );
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/inventory_sources/');
  const inventorySourceChoices = useMemo(
    () =>
      data &&
      data.actions &&
      data.actions['GET'] &&
      data.actions['GET'].source &&
      Array.isArray(data.actions['GET'].source.choices)
        ? data.actions['GET'].source.choices
        : [],
    [data]
  );
  const scheduleUrl = useMemo(
    () => (job.summary_fields?.schedule ? getScheduleUrl(job) ?? '' : ''),
    [job]
  );

  return (
    <PageDetails>
      {job.type === 'inventory_update' && (
        <PageDetail label={t(`Source`)}>
          {inventorySourceChoices?.map(([string, label]) => (string === job.source ? label : null))}
        </PageDetail>
      )}
      <PageDetail label={t(`Launched by`)}>
        {launchedByLink ? <Link to={`${launchedByLink}`}>{launchedByValue}</Link> : launchedByValue}
      </PageDetail>
      {job.launch_type === 'scheduled' &&
        (job.summary_fields?.schedule ? (
          <PageDetail label={t`Schedule`}>
            <Link to={scheduleUrl}>{job.summary_fields?.schedule.name}</Link>
          </PageDetail>
        ) : (
          <PageDetail label={t(`Schedule`)}>{t(`Deleted`)}</PageDetail>
        ))}
      {job.summary_fields?.job_template && (
        <PageDetail label={t`Job Template`}>
          <Link
            to={RouteObj.JobTemplateDetails.replace(
              ':id',
              job.summary_fields?.job_template?.id.toString()
            )}
          >
            {job.summary_fields?.job_template?.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.workflow_job_template && (
        <PageDetail label={t`Workflow Job Template`}>
          <Link
            to={RouteObj.WorkflowJobTemplateDetails.replace(
              ':id',
              job.summary_fields?.workflow_job_template.id.toString()
            )}
          >
            {job.summary_fields?.workflow_job_template.name}
          </Link>
        </PageDetail>
      )}
      {job.summary_fields?.source_workflow_job && (
        <PageDetail label={t`Source Workflow Job`}>
          <Link
            to={RouteObj.WorkflowJobTemplateDetails.replace(
              ':id',
              workflowJobTemplate.id.toString()
            )}
          >
            {workflowJobTemplate.name}
          </Link>
        </PageDetail>
      )}
    </PageDetails>
  );
}
