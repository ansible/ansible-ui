import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { RulesPreview } from '../components/RulesPreview';
import { ExceptionsPreview } from '../components/ExceptionsPreview';
import { RRule, rrulestr, Options, RRuleSet } from 'rrule';
import { useState } from 'react';

export function ScheduleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; schedule_id: string }>();
  const { pathname } = useLocation();
  const getPageUrl = useGetPageUrl();
  const history = useNavigate();
  const {
    data: schedule,
    error,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);
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
  const isSystemJobTemplateSchedule: boolean = pathname.includes('management-jobs');

  return (
    <>
      <PageDetails numberOfColumns="multiple">
        <PageDetail label={t('Name')}>{schedule?.name}</PageDetail>
        <PageDetail label={t('Description')}>{schedule?.description}</PageDetail>
        <PageDetail label={t('First run')}>{formatDateString(schedule?.dtstart)}</PageDetail>
        <PageDetail label={t('Next run')}>{formatDateString(schedule?.next_run)}</PageDetail>
        <PageDetail label={t('Last run')}>{formatDateString(schedule?.dtend)}</PageDetail>
        <PageDetail label={t('Time zone')}>{schedule?.timezone}</PageDetail>
        <PageDetail label={t('Rrule')} fullWidth>
          {schedule?.rrule}
        </PageDetail>
        {!isSystemJobTemplateSchedule && (
          <>
            <UserDateDetail
              label={t('Created')}
              date={schedule.created}
              user={schedule.summary_fields.created_by}
            />
            <LastModifiedPageDetail
              value={schedule.modified}
              author={schedule.summary_fields.modified_by?.username}
              onClick={() =>
                history(
                  getPageUrl(AwxRoute.UserDetails, {
                    params: { id: (schedule.summary_fields?.modified_by?.id ?? 0).toString() },
                  })
                )
              }
            />
          </>
        )}
        <PageDetail fullWidth>
          <Divider />
        </PageDetail>
        <PageDetail label={t('Inventory')}>{schedule.summary_fields.inventory?.name}</PageDetail>
        <PageDetail label={t('Job type')}>{schedule.job_type}</PageDetail>
        <PageDetail label={t('Limit')}>{schedule.limit}</PageDetail>
        <PageDetail label={t('Verbosity')}>{schedule.verbosity}</PageDetail>
        <PageDetail label={t('Show changes')}>{schedule.diff_mode ? t`On` : t`Off`}</PageDetail>
        <PageDetail label={t('Job tags')} isEmpty={!schedule.job_tags}>
          <LabelGroup>{jobTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
        </PageDetail>
        <PageDetail label={t('Skip tags')} isEmpty={!schedule.skip_tags}>
          <LabelGroup>{skipTags?.map(({ name }) => <Label key={name}>{name}</Label>)}</LabelGroup>
        </PageDetail>
        <PageDetail fullWidth>
          <PageDetailCodeEditor
            label={t('Variables')}
            value={JSON.stringify(schedule.extra_data)}
          />
        </PageDetail>
        {schedule && <ScheduleSummary rrule={schedule.rrule}></ScheduleSummary>}
        <PageDetail fullWidth>
          <Divider />
        </PageDetail>
        <PageDetail fullWidth>
          <RulesPreview rrule={schedule.rrule}></RulesPreview>
          {schedule.rrule.includes('EXRULE') && (
            <ExceptionsPreview rrule={schedule.rrule}></ExceptionsPreview>
          )}
        </PageDetail>
      </PageDetails>
    </>
  );
}

export function ScheduleSummary(props: { rrule: string }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('local');
  const rRruleString = rrulestr(props.rrule, { forceset: true }) as RRuleSet;
  const rRule = rRruleString._rrule[0].options as Options;
  const newRule = new RRule(rRule);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        <Flex>
          <FlexItem>{t('Schedule summary')}</FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <ToggleGroup isCompact>
              <ToggleGroupItem
                id="toggle-local"
                data-cy="toggle-local"
                aria-label={t('Toggle to local')}
                isSelected={mode === 'local'}
                text="Local"
                type="button"
                onChange={() => setMode('local')}
              />
              <ToggleGroupItem
                id="toggle-utc"
                data-cy="toggle-utc"
                aria-label={t('Toggle to UTC')}
                isSelected={mode === 'utc'}
                text="UTC"
                type="button"
                onChange={() => setMode('utc')}
              />
            </ToggleGroup>
          </FlexItem>
        </Flex>
      </DescriptionListTerm>
      {newRule
        .all((_rule, i) => i < 12)
        .slice(2, 12)
        ?.map((value, i) => {
          return (
            <DescriptionListDescription key={i}>
              {mode === 'utc' ? formatDateString(value.toISOString()) : value.toDateString()}
            </DescriptionListDescription>
          );
        })}
    </DescriptionListGroup>
  );
}
