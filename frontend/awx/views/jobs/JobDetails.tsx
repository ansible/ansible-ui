import { Label, LabelGroup, Skeleton } from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useJobsColumns } from './hooks/useJobsColumns';
import { useGetJob } from './JobPage';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { useTranslation } from 'react-i18next';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';
import { StatusCell } from '../../../common/Status';
import { AwxRoute } from '../../main/AwxRoutes';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { ExecutionEnvironmentDetail } from '../../../common/ExecutionEnvironmentPageDetail';

export function JobDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; job_type: string; job_id: string }>();
  const { job } = useGetJob(params.job_id ? params.job_id : params.id, params.job_type);
  const columns = useJobsColumns();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  if (params.job_id && !job)
    return <EmptyStateNoData title="" description={t('Workflow job deleted')} />;
  if (!job) return <Skeleton />;
  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={job} />
      {job.playbook && <PageDetail label={t('Playbook')}>{job.playbook}</PageDetail>}
      {job.summary_fields.project_update?.status && (
        <PageDetail label={t('Project update status')}>
          <StatusCell
            status={job.summary_fields.project_update?.status}
            to={`/jobs/project_update/${job.summary_fields.project_update?.id}`}
          />
        </PageDetail>
      )}
      {job.scm_revision && <PageDetail label={t('Revision')}>{job.scm_revision}</PageDetail>}
      {job.controller_node && (
        <PageDetail label={t('Controller node')}>{job.controller_node}</PageDetail>
      )}
      <ExecutionEnvironmentDetail
        executionEnvironment={job.summary_fields.execution_environment}
        verifyMissingVirtualEnv={false}
      />
      {job.execution_node && (
        <PageDetail label={t('Execution node')}>{job.execution_node}</PageDetail>
      )}
      {job.summary_fields.instance_group &&
        !job.summary_fields.instance_group?.is_container_group && (
          <PageDetail label={t('Instance group')}>
            <Link
              to={getPageUrl(AwxRoute.InstanceGroupDetails, {
                params: { id: job.summary_fields?.instance_group?.id },
              })}
            >
              {job.summary_fields?.instance_group?.name}
            </Link>
          </PageDetail>
        )}
      {job.summary_fields.instance_group?.is_container_group && (
        <PageDetail label={t('Container group')}>
          <Link
            to={getPageUrl(AwxRoute.InstanceGroupDetails, {
              params: { id: job.summary_fields?.instance_group?.id },
            })}
          >
            {job.summary_fields?.instance_group?.name}
          </Link>
        </PageDetail>
      )}
      {job.forks ? <PageDetail label={t('Forks')}>{job.forks}</PageDetail> : null}
      {job.timeout ? <PageDetail label={t('Timeout')}>{job.timeout}</PageDetail> : null}
      {job.verbosity ? <PageDetail label={t('Verbosity')}>{job.verbosity}</PageDetail> : null}
      <PageDetail label={t('Job tags')} isEmpty={!job.job_tags}>
        <LabelGroup>
          {job.job_tags?.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Skip tags')} isEmpty={!job.skip_tags}>
        <LabelGroup>
          {job.skip_tags?.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Module arguments')} isEmpty={!job.module_args}>
        {job.module_args}
      </PageDetail>
      {job.summary_fields?.created_by?.username && (
        <PageDetail label={t('Created by')}>
          <DateTimeCell
            value={job.created}
            author={job.summary_fields.created_by?.username}
            onClick={() =>
              pageNavigate(AwxRoute.UserDetails, {
                params: { id: job.summary_fields?.created_by?.id },
              })
            }
          />
        </PageDetail>
      )}
      {job.modified && (
        <LastModifiedPageDetail
          value={job.modified}
          author={job.summary_fields?.modified_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: job.summary_fields?.modified_by?.id },
            })
          }
        />
      )}
      <PageDetailCodeEditor
        label={t`Extra Variables`}
        showCopyToClipboard
        data-cy="inventory-source-detail-variables"
        value={job.extra_vars ?? ''}
      />
    </PageDetails>
  );
}
