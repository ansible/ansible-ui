import { Label, LabelGroup } from '@patternfly/react-core';
import { Link, useOutletContext } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useJobsColumns } from './hooks/useJobsColumns';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { useTranslation } from 'react-i18next';
import { StatusCell } from '../../../common/Status';
import { AwxRoute } from '../../main/AwxRoutes';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { Job } from '../../interfaces/Job';
import { useVerbosityString } from '../../common/useVerbosityString';
import { UnifiedJob } from '../../interfaces/UnifiedJob';

export function JobDetails() {
  const { t } = useTranslation();
  const columns = useJobsColumns();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { job } = useOutletContext<{ job: Job }>();

  const verbosity = useVerbosityString(job.verbosity || 0);
  const timeoutDefaultText = t`No timeout specified`;

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={job as UnifiedJob} />
      <PageDetail isEmpty={!job.playbook} label={t('Playbook')}>
        {job.playbook}
      </PageDetail>
      <PageDetail
        isEmpty={!job.summary_fields.project_update?.status}
        label={t('Project update status')}
      >
        <StatusCell
          status={job.summary_fields.project_update?.status}
          to={`/jobs/project_update/${job.summary_fields.project_update?.id}`}
        />
      </PageDetail>
      <PageDetail isEmpty={!job.scm_revision} label={t('Revision')}>
        {job.scm_revision}
      </PageDetail>
      <PageDetail isEmpty={!job.controller_node} label={t('Controller node')}>
        {job.controller_node}
      </PageDetail>
      <PageDetail
        isEmpty={!job.execution_node}
        label={t('Execution node')}
        helpText={t('The execution node used to run the job.')}
      >
        {job.execution_node}
      </PageDetail>
      <PageDetail
        helpText={t('Instance group used on this job run.')}
        isEmpty={!job.summary_fields.instance_group?.is_container_group}
        label={t('Instance group')}
      >
        <Link
          to={getPageUrl(AwxRoute.InstanceGroupDetails, {
            params: {
              id: job.summary_fields?.instance_group?.id,
            },
          })}
        >
          {job.summary_fields?.instance_group?.name}
        </Link>
      </PageDetail>
      <PageDetail
        isEmpty={!job.summary_fields.instance_group?.is_container_group}
        label={t('Container group')}
      >
        <Link
          to={getPageUrl(AwxRoute.InstanceGroupDetails, {
            params: {
              id: job.summary_fields?.instance_group?.id,
            },
          })}
        >
          {job.summary_fields?.instance_group?.name}
        </Link>
      </PageDetail>
      <PageDetail
        label={t('Forks')}
        helpText={t(
          'The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to ansible.cfg. Refer to the Ansible documentation for details about the configuration file.'
        )}
      >
        {job.forks}
      </PageDetail>
      <PageDetail
        label={t('Timeout')}
        helpText={t(
          'The amount of time (in seconds) to run before the job is canceled. Defaults to 0 for no job timeout.'
        )}
      >
        {job.timeout === 0 ? timeoutDefaultText : job.timeout}
      </PageDetail>
      <PageDetail
        label={t('Verbosity')}
        helpText={t('Control the level of output ansible will produce as the playbook executes.')}
      >
        {verbosity}
      </PageDetail>
      <PageDetail
        label={t('Job tags')}
        helpText={t('Job tags used during this job.')}
        isEmpty={!job.job_tags}
      >
        <LabelGroup>
          {job.job_tags?.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail
        helpText={t('Skip tags used during this job.')}
        label={t('Skip tags')}
        isEmpty={!job.skip_tags}
      >
        <LabelGroup>
          {job.skip_tags?.split(',')?.map((tag) => <Label key={tag}>{tag}</Label>)}
        </LabelGroup>
      </PageDetail>
      <PageDetail label={t('Module arguments')} isEmpty={!job.module_args}>
        {job.module_args}
      </PageDetail>
      <PageDetail isEmpty={!job.summary_fields?.created_by?.username} label={t('Created')}>
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
      <LastModifiedPageDetail
        value={job.modified}
        author={job.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: job.summary_fields?.modified_by?.id },
          })
        }
      />
      <PageDetailCodeEditor
        label={t`Extra variables`}
        helpText={t(
          'Extra variables used on this job.  This is the -e or --extra-vars command line parameter for ansible-playbook. Provide key/value pairs using either YAML or JSON. Refer to the documentation for example syntax.'
        )}
        showCopyToClipboard
        data-cy="inventory-source-detail-variables"
        value={job.extra_vars ?? ''}
      />
    </PageDetails>
  );
}
