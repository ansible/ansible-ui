import { useTranslation } from 'react-i18next';
import { PageForm, PageHeader, PageLayout } from '../../../../framework';
import { RuleInputs } from './components/RuleInputs';
import { DateTime } from 'luxon';
import { useLocation, useParams } from 'react-router-dom';
import { scheduleRulesRoutes } from './hooks/ruleHelpers';
import { useMemo, useState } from 'react';
import { requestGet, requestPatch } from '../../../common/crud/Data';
import { Schedule } from '../../interfaces/Schedule';
import { Options, RRule, Weekday } from 'rrule';
import { LoadingPage } from '../../../../framework/components/LoadingPage';

import { buildDateTimeObj } from './hooks/scheduleHelpers';

export interface RuleFormFields {
  freq: number;
  frequencies: string[];
  interval: number;
  wkst: number;
  byweekday: Weekday[];
  bysetpos: number[];
  byweekno: number[];
  byyearday: number[];
  until: { date: string; time: string };
  count: number;
  bymonth: { name: string; value: number }[];
  timezone: string;
  startDateTime: { date: string; time: string };
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

  const onSubmit = async (
    values: Omit<Options, 'until'> & {
      startDateTime: unknown;
      until: { date: string; time: string };
      timezone: string;
    }
  ) => {
    if (!scheduleContainer) return; /// we actually want to throw and error here probably
    const {
      until: { date, time },
      startDateTime,
      timezone,
      ...rest
    } = values;

    const container = RRule.fromString(scheduleContainer?.rrule);
    // const {
    //   options: { freq, dtstart, tzid },
    // } = container;

    const updatedContainer = {
      ...container,
      options: {
        ...rest,
        ...container.options,
      },
    };

    if (date || time) {
      updatedContainer.options.until = buildDateTimeObj({ date, time, timezone }).options.until;

      const rruleObject = new RRule({
        ...updatedContainer.options,
      });

      await requestPatch<Schedule>(`/api/v2/schedules/${scheduleContainer.id}/`, {
        rrule: rruleObject.toString(),
      }).then((res) => {
        console.log(res);
      });
    }
  };
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
  const rule = new RRule(RRule.fromString(scheduleContainer.rrule).options);

  const startTime = `${rule.options.byhour.toString()}:${rule.options.byminute.toString()}`;

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
          interval: 1,
          freq: 0,
          timezone:
            RRule.fromString(scheduleContainer.rrule).options.tzid ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          startDateTime: {
            date: DateTime.fromISO(
              RRule.fromString(scheduleContainer.rrule).options.dtstart.toISOString()
            ).toFormat('yyyy-LL-dd'),
            time: startTime,
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
