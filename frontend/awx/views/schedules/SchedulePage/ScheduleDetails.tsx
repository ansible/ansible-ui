import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/dateTimeHelpers';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { Divider, Label, LabelGroup } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { parseRruleComponents } from '../hooks/ruleHelpers';
import { AwxError } from '../../../common/AwxError';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { CredentialLabel } from '../../../common/CredentialLabel';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { RulesList } from '../components/RulesList';
import { ScheduleSummary } from '../components/ScheduleSummary';
import { TimezoneToggle } from './TimezoneToggle';

/**
 *
 * @param {boolean} [isSystemJobTemplateSchedule] - This is used to determine we need to render the
 * created by / modified by values.  Since a system job template is create under the hood those
 * two fields do not apply
 *
 */
export function ScheduleDetails(props: { isSystemJobTemplateSchedule?: boolean }) {
  const { t } = useTranslation();
  const [isLocal, setIsLocal] = useState(true);

  const params = useParams<{ id: string; schedule_id: string }>();
  const pageNavigate = usePageNavigate();
  const {
    data: schedule,
    error,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);
  const { data: credentialResponse } = useGet<AwxItemsResponse<Credential>>(
    awxAPI`/schedules/${params.schedule_id || ''}/credentials/`
  );

  // Fetch the unified job template to get scm_branch when it's set on the template
  // but not on the schedule (i.e., when prompt on launch is not enabled)
  const unifiedJobType = schedule?.summary_fields?.unified_job_template?.unified_job_type;
  const templateId = schedule?.summary_fields?.unified_job_template?.id;
  const shouldFetchTemplate =
    (unifiedJobType === 'job' || unifiedJobType === 'workflow_job') && templateId;
  const templateUrl = shouldFetchTemplate
    ? unifiedJobType === 'job'
      ? awxAPI`/job_templates/${templateId.toString()}/`
      : awxAPI`/workflow_job_templates/${templateId.toString()}/`
    : undefined;
  const { data: template } = useGet<JobTemplate | WorkflowJobTemplate>(templateUrl);
  const jobTags =
    typeof schedule?.job_tags === 'string'
      ? parseStringToTagArray(schedule?.job_tags)
      : schedule?.job_tags;
  const skipTags =
    typeof schedule?.skip_tags === 'string'
      ? parseStringToTagArray(schedule?.skip_tags)
      : schedule?.skip_tags;
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!schedule) return <LoadingPage breadcrumbs tabs />;

  const hasDaysToKeep: boolean = JSON.stringify(schedule?.extra_data).includes('days');
  const extraData = schedule?.extra_data as string | object;

  const { dtstart, rruleLines, exruleLines } = parseRruleComponents(schedule.rrule);
  const rules = rruleLines.map((rruleLine, i) => ({
    rule: dtstart ? `${dtstart}\n${rruleLine}` : rruleLine,
    id: i,
  }));
  const exceptions = exruleLines.map((exruleLine, i) => ({
    rule: dtstart ? `${dtstart}\n${exruleLine}` : exruleLine,
    id: i,
  }));
  return (
    <>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{schedule?.name}</PageDetail>
        <PageDetail label={t('Description')}>{schedule?.description}</PageDetail>
        <PageDetail label={t('First run')}>
          {formatDateString(schedule?.dtstart, schedule.timezone)}
        </PageDetail>
        {schedule.next_run ? (
          <PageDetail label={t('Next run')}>
            {formatDateString(schedule?.next_run, schedule.timezone)}
          </PageDetail>
        ) : null}
        {schedule.dtend ? (
          <PageDetail label={t('Last run')}>
            {formatDateString(schedule?.dtend, schedule.timezone)}
          </PageDetail>
        ) : null}
        <PageDetail label={t('Time zone')}>{schedule?.timezone}</PageDetail>
        <PageDetail label={t('RruleSet')} fullWidth>
          <CopyCell text={schedule?.rrule.toString()} />
        </PageDetail>
        {!props.isSystemJobTemplateSchedule && (
          <>
            <UserDateDetail
              label={t('Created')}
              date={schedule.created}
              user={schedule.summary_fields?.created_by}
            />
            <LastModifiedPageDetail
              value={schedule.modified}
              author={schedule.summary_fields.modified_by?.username}
              onClick={() =>
                pageNavigate(AwxRoute.UserDetails, {
                  params: { id: schedule.summary_fields.modified_by?.id },
                })
              }
            />
          </>
        )}
        <PageDetail fullWidth>
          <Divider />
        </PageDetail>
        <PageDetail label={t('Credentials')}>
          <LabelGroup>
            {credentialResponse?.results?.map((credential: Credential) => (
              <CredentialLabel credential={credential} key={credential.id} />
            ))}
          </LabelGroup>
        </PageDetail>
        <PageDetail label={t('Inventory')}>{schedule.summary_fields.inventory?.name}</PageDetail>
        <PageDetail label={t('Execution Envionment')}>
          {schedule.summary_fields.execution_environment?.name}
        </PageDetail>
        <PageDetail label={t('Source control branch')}>
          {schedule.scm_branch || template?.scm_branch}
        </PageDetail>
        <PageDetail label={t('Job type')}>{schedule.job_type}</PageDetail>
        <PageDetail label={t('Limit')}>{schedule.limit}</PageDetail>
        <PageDetail label={t('Forks')}>{schedule.forks}</PageDetail>
        <PageDetail label={t('Job slicing')}>{schedule.job_slice_count}</PageDetail>
        <PageDetail label={t('Timeout')}>{schedule.timeout}</PageDetail>
        <PageDetail label={t('Verbosity')}>{schedule.verbosity}</PageDetail>
        <PageDetail label={t('Show changes')}>{schedule.diff_mode ? t`On` : t`Off`}</PageDetail>
        <PageDetail label={t('Job tags')} isEmpty={!schedule.job_tags}>
          <LabelGroup>{jobTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
        </PageDetail>
        <PageDetail label={t('Skip tags')} isEmpty={!schedule.skip_tags}>
          <LabelGroup>{skipTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
        </PageDetail>
        {!hasDaysToKeep && (
          <PageDetail fullWidth>
            <PageDetailCodeEditor
              label={t('Extra variables')}
              value={JSON.stringify(schedule.extra_data)}
            />
          </PageDetail>
        )}
        {hasDaysToKeep && (
          <PageDetail fullWidth label={t('Days of data to keep')}>
            {typeof extraData === 'string'
              ? extraData.toString().replace('}', '').split(':')[1]
              : schedule.extra_data.days?.toString()}
          </PageDetail>
        )}

        {schedule && (
          <>
            <PageDetail fullWidth label={t('Toggle timezone')}>
              <TimezoneToggle
                isLocal={isLocal}
                setIsLocal={setIsLocal}
                localTimezone={schedule.timezone}
              />
            </PageDetail>

            <ScheduleSummary rrule={schedule.rrule} isLocal={isLocal} />
          </>
        )}

        <PageDetail fullWidth>
          <RulesList
            ruleType="rules"
            timezone={schedule.timezone}
            rules={rules}
            isLocalForDetails={isLocal}
          />
          {exceptions.length ? (
            <RulesList
              ruleType="exceptions"
              timezone={schedule.timezone}
              rules={exceptions}
              isLocalForDetails={isLocal}
            />
          ) : null}
        </PageDetail>
      </PageDetails>
    </>
  );
}
