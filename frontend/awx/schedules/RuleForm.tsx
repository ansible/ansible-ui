import { useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Options, RRule, RRuleSet, Weekday } from 'rrule';
import {
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  usePageAlertToaster,
} from '../../../framework';
import { LoadingPage } from '../../../framework/components/LoadingPage';
import { formatDateString } from '../../../framework/utils/dateTimeHelpers';
import { requestGet, requestPatch } from '../../common/crud/Data';
import { AwxError } from '../common/AwxError';
import { AwxPageForm } from '../common/AwxPageForm';
import { awxAPI } from '../common/api/awx-utils';
import { Schedule } from '../interfaces/Schedule';
import { RuleInputs } from './components/RuleInputs';
import { useScheuleRulesRoutes } from './hooks/ruleHelpers';
import { buildDateTimeObj } from './hooks/scheduleHelpers';

export interface RuleFormFields {
  freq: number;
  interval: number;
  wkst: number;
  dtstart: { date: string; time: string };
  byweekday: Weekday[];
  bysetpos: number[];
  byweekno: number[];
  byyearday: number[];
  bymonthday: number[];
  bynmonthday: number[];
  byhour: number[];
  byminute: number[];
  bysecond: number[];
  until: { date: string; time: string };
  count: number;
  bymonth: number[];
  timezone: string;
  byeaster: number;
}

export function CreateScheduleRule() {
  const { t } = useTranslation();
  const [error, setError] = useState<Error | null>(null);
  const [scheduleContainer, setScheduleContainer] = useState<Schedule>();
  const { pathname } = useLocation();
  const { schedule_id, id: resource_id } = useParams<{
    schedule_id: string;
    id: string;
    source_id?: string;
  }>();
  const navigate = useNavigate();
  const alertToaster = usePageAlertToaster();
  const scheduleRulesRoutes = useScheuleRulesRoutes();

  const onSubmit: PageFormSubmitHandler<RuleFormFields> = async (
    values: RuleFormFields,
    _setError,
    _setFieldError,
    form: UseFormReturn<RuleFormFields, object> | undefined
  ) => {
    if (!scheduleContainer) return;
    const { until, dtstart, timezone, ...rest } = values;
    const container = RRule.fromString(scheduleContainer?.rrule);

    const updatedContainer: Options = {
      ...container.options,
      ...rest,
    };
    if (until?.date || until?.time) {
      const { date, time } = until;
      updatedContainer.until = buildDateTimeObj({
        date,
        time,
        timezone,
        start: false,
      }).options.until;
    }

    const [start, ...rules] = scheduleContainer.rrule.split(' ');
    scheduleContainer.rrule.split(' ');
    const rruleObject = new RRule(updatedContainer);
    const set = new RRuleSet();
    set.rrule(rruleObject);
    const updatedRules = rules.filter((rule) => rule !== rruleObject.toString().split('\n')[1]);
    const dedupedRRuleString = [start, updatedRules[0], set.toString().split('\n')[1]].join(' ');

    await requestPatch<Schedule>(awxAPI`/schedules/${scheduleContainer.id.toString()}/`, {
      rrule: dedupedRRuleString,
    })
      .then((res) => {
        alertToaster.addAlert({
          variant: 'success',
          title: t(`Successfully added rule to schedule ${res.name}`),
        });
        if (form !== undefined) {
          const { reset } = form;
          reset(
            {
              ...form.formState.defaultValues,
            },
            {
              keepValues: false,
              keepDirty: false,
              keepErrors: false,
              keepTouched: false,
            }
          );
        } else {
          navigate(
            scheduleRulesRoutes[
              pathname.split('/').find((i) => Object.keys(scheduleRulesRoutes).includes(i)) || ''
            ]
              ?.replace(':id', res.summary_fields.unified_job_template.id.toString())
              .replace(':schedule_id', res.id.toString()) ?? ''
          );
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          alertToaster.addAlert({
            variant: 'danger',
            title: t('Failed to add rule to schedule'),
            children: err instanceof Error && err.message,
          });
        }
      });
  };

  const onCancel = () => {
    navigate(
      scheduleRulesRoutes[
        pathname.split('/').find((i) => Object.keys(scheduleRulesRoutes).includes(i)) || ''
      ]
        ?.replace(':id', resource_id as string)
        .replace(':schedule_id', schedule_id as string) ?? ''
    );
  };

  useMemo(() => {
    if (!schedule_id) return;
    void requestGet<Schedule>(awxAPI`/schedules/${schedule_id}`)
      .then((res) => {
        setScheduleContainer(res);
      })
      .catch((err) => {
        if (err instanceof Error) setError(err);
      });
  }, [schedule_id]);

  if (!scheduleContainer) {
    return <LoadingPage />;
  }
  if (error) {
    return <AwxError error={error} />;
  }

  const dtstart = formatDateString(scheduleContainer.dtstart, scheduleContainer.timezone);

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Rules')}
        breadcrumbs={[
          { label: t('Rules'), to: scheduleRulesRoutes[pathname.split('/')[2]] },
          { label: t('Create Rules') },
        ]}
      />
      <AwxPageForm<RuleFormFields>
        defaultValue={{
          interval: 1,
          freq: 0,
          timezone:
            RRule.fromString(scheduleContainer.rrule).options.tzid ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          dtstart: { date: dtstart.split(',')[0], time: dtstart.split(',')[1] },
        }}
        submitText={t('Finalize rules')}
        additionalActionText={t('Create another rule')}
        onClickAdditionalAction={onSubmit}
        cancelText={t('Cancel')}
        onSubmit={onSubmit}
        onCancel={onCancel}
      >
        <RuleInputs />
      </AwxPageForm>
    </PageLayout>
  );
}
