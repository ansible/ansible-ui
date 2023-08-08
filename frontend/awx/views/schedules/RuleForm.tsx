import { useTranslation } from 'react-i18next';
import { PageForm, PageHeader, PageLayout } from '../../../../framework';
import { RuleInputs } from './components/RuleInputs';
import { DateTime } from 'luxon';
import { dateToInputDateTime } from '../../../../framework/utils/dateTimeHelpers';
import { useLocation, useParams } from 'react-router-dom';
import { scheduleRulesRoutes } from './hooks/ruleHelpers';
import { useMemo, useState } from 'react';
import { requestGet } from '../../../common/crud/Data';
import { Schedule } from '../../interfaces/Schedule';
import { RRule } from 'rrule';
import { LoadingPage } from '../../../../framework/components/LoadingPage';

export interface RuleFormFields {
  freq: number;
  frequencies: string[];
  interval: number;
  wkst?: string;
  byweekday?: { value: string; nmw: string };
  bysetpos?: number[];
  byweekno?: number[];
  byyearday?: number[];
  until: { endDate: string; endTime: string };
  count?: number;
  bymonth: { name: string; value: number }[];
  timezone: string;
  startDateTime: { startDate: string; startTime: string };
}

export function CreateScheduleRule() {
  const { t } = useTranslation();
  const [scheduleContainer, setScheduleContainer] = useState<Schedule>();
  const { pathname } = useLocation();
  const { schedule_id } = useParams<{
    schedule_id: string;
    id: string;
    source_id?: string;
  }>();
  const now = DateTime.now();

  const closestQuarterHour: DateTime = DateTime.fromMillis(
    Math.ceil(now.toMillis() / 900000) * 900000
  );
  const [, time]: string[] = dateToInputDateTime(closestQuarterHour.toISO() as string);
  const onSubmit = () => {};
  const onCancel = () => {};
  useMemo(() => {
    if (!schedule_id) return;
    void requestGet<Schedule>(`/api/v2/schedules/${schedule_id}`).then((res) => {
      setScheduleContainer(res);
    });
  }, [schedule_id]);

  if (!scheduleContainer) {
    return <LoadingPage />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Rules')}
        breadcrumbs={[
          { label: t('Rules'), to: scheduleRulesRoutes[pathname.split('/')[2]] },
          { label: t('Create Rules') },
        ]}
      />
      <PageForm<RuleFormFields>
        defaultValue={{
          freq: 3,
          interval: 1,
          wkst: 'SU',
          until: { endDate: DateTime.now().toFormat('yyyy-LL-dd'), endTime: time },
          timezone:
            RRule.fromString(scheduleContainer.rrule).options.tzid ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          startDateTime: {
            startDate: DateTime.fromISO(
              RRule.fromString(scheduleContainer.rrule).options.dtstart.toISOString()
            ).toFormat('yyyy-LL-dd'),
            startTime: DateTime.fromISO(
              RRule.fromString(scheduleContainer.rrule).options.dtstart.toISOString()
            ).toFormat('h:mm:ss'),
          },
        }}
        scheduleContainer={scheduleContainer}
        submitText={t('Create another rule')}
        additionalActionText={t('Finalize rules')}
        onClickAdditionalAction={() => {}}
        cancelText={t('Cancel rule creation')}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        <RuleInputs />
      </PageForm>
    </PageLayout>
  );
}
