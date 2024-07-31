import { ActionGroup, Button, Chip, ChipGroup } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RRule, datetime } from 'rrule';
import {
  useGetFrequencyOptions,
  useGetMonthOptions,
  useGetWeekdayOptions,
} from '../hooks/ruleHelpers';
import { RuleFields, RuleListItemType, RuleType, ScheduleFormWizard } from '../types';
import {
  DAYS_OF_MONTH,
  DAYS_OF_YEAR,
  HOURS_OF_DAY,
  MINUTES_OF_HOUR,
  WEEKS_OF_YEAR,
} from '../wizard/constants';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';
import { useGet24HourTime } from '../hooks/useGet24HourTime';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormSingleSelect } from '../../../../../framework/PageForm/Inputs/PageFormSingleSelect';

export function pad(num: number) {
  if (typeof num === 'string') {
    return num;
  }
  return num < 10 ? `0${num}` : num;
}
export function RuleForm(
  props: Readonly<{
    title: string;
    isOpen: boolean | number;
    setIsOpen: (isOpen: boolean) => void;
  }>
) {
  const { t } = useTranslation();
  const get24Hour = useGet24HourTime();
  const {
    getValues,
    reset,
    formState: { defaultValues },
    setValue,
  } = useFormContext();
  const { activeStep, wizardData } = usePageWizard();
  const ruleId = typeof props.isOpen === 'number' && props.isOpen;
  const endType = useWatch({ name: 'endType' }) as string;

  const {
    timezone = 'America/New_York',
    startDateTime: { date, time },
  } = wizardData as ScheduleFormWizard;
  const isRulesStep = activeStep && activeStep.id === 'rules';
  const weekdayOptions = useGetWeekdayOptions();
  const frequencyOptions = useGetFrequencyOptions();
  const monthOptions = useGetMonthOptions();

  useEffect(() => {
    if (ruleId) {
      const rules = getValues('rules') as RuleListItemType[];
      const ruleOptions = rules[rules.findIndex((r) => r.id === ruleId)].rule.options;
      // const { until } = ruleOptions;

      // if (until === null) return;
      // const [date, time] = dateToInputDateTime(until?.toISOString() || '');
      // reset(
      //   {
      //     ...ruleOptions,
      //     until: {
      //       date,
      //       time,
      //     },
      //     rules,
      //   },
      //   { keepDefaultValues: true }
      // );
    }
  }, [getValues, reset, props.isOpen, timezone, ruleId]);
  const handleAddItem = () => {
    const values = getValues() as RuleFields;
    delete values.endType;
    delete values.id;
    const { rules = [], exceptions = [], until = null, ...rest } = values;
    const start = DateTime.fromISO(`${date}`).set(get24Hour(time));
    const { year, month, day, hour, minute } = start;
    const dateString = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    const rrulestring = `DTSTART;TZID=${timezone}:${dateString}`;
    const ruleStart = RRule.fromString(rrulestring);
    const rule = new RRule({ ...ruleStart.options, ...rest });
    if (until !== null) {
      const { time: untilTime, date: untilDate } = until;

      if (untilDate && untilTime) {
        const utcDate = DateTime.fromISO(`${untilDate}`, { zone: timezone })
          .set(get24Hour(untilTime))
          .toUTC();
        const { year, month, day, hour, minute } = utcDate;
        rule.options.until = datetime(year, month, day, hour, minute);
      } else {
        if (untilDate) {
          // This block is used when the user enters a date, but no time.
          // We use the date given, and the current time based on the timezone given
          // in the first step, or default to America/New_York.

          const utcDate = DateTime.fromISO(`${untilDate}`, { zone: timezone }).toUTC();
          const { year, day, month, hour, minute } = utcDate;
          rule.options.until = datetime(year, month, day, hour, minute);
        }
        if (untilTime) {
          // This block is used when the user enters a time, but no date.
          // We use the time given, and the tomorrow's date based on the timezone given
          // in the first step, or default to America/New_York.

          const { year, day, month, hour, minute } = DateTime.now()
            .plus({ days: 1 })
            .set(get24Hour(untilTime))
            .toUTC();

          rule.options.until = datetime(year, month, day, hour, minute);
        }
      }
    }

    const itemId = ruleId
      ? ruleId
      : isRulesStep
        ? rules.length + 1 || 1
        : exceptions.length + 1 || 1;
    const ruleObject = { rule, id: itemId };
    const index = isRulesStep
      ? rules.findIndex((r) => r.id === ruleId)
      : exceptions.findIndex((r) => r.id === ruleId);
    if (isRulesStep) {
      ruleId
        ? setValue('rules', rules.splice(index, 1, ruleObject))
        : setValue('rules', rules.push(ruleObject));
    }
    if (!isRulesStep) {
      ruleId
        ? setValue('exceptions', exceptions.splice(index, 1, ruleObject))
        : setValue('exceptions', exceptions.push(ruleObject));
    }

    reset(
      {
        ...defaultValues,
        rules,
        exceptions,
      },
      { keepDefaultValues: true }
    );
    props.setIsOpen(false);
  };
  return (
    <PageFormSection title={props.title}>
      <PageFormSection>
        <PageFormSelect<RuleFields>
          name={`freq`}
          isRequired
          label={t('Frequency')}
          labelHelp={t('This is the freq field.  It is required.')}
          options={frequencyOptions}
        />
        <PageFormTextInput<RuleFields>
          labelHelp={t('This is the interval field.')}
          name={`interval`}
          label={t('Interval')}
          type="number"
        />
        <PageFormSelect<RuleFields>
          name={`wkst`}
          label={t('Week start')}
          labelHelp={t('This is the wkst field. Select first day of the week.')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<RuleFields>
          label={t('Weekdays')}
          name={`byweekday`}
          options={weekdayOptions}
          placeholder={t('Select weekdays')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byweekday field. Select day(s) of the week on which to run the schedule.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>{t('Sunday')}</Chip>
                <Chip disabled>{t('Wednesday')}</Chip>
                <Chip disabled>{t('Friday')}</Chip>
              </ChipGroup>
            </>
          }
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonth`}
          label={t('Months')}
          options={monthOptions}
          labelHelpTitle={t('Months')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bymonth field. This field is used to declare which months of the year the schedule should run.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>{t('June')}</Chip>
                <Chip disabled>{t('August')}</Chip>
                <Chip disabled>{t('January')}</Chip>
              </ChipGroup>
            </>
          }
          placeholder={t('Select months')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks')}
          label={t('Annual week(s) number')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byweekno field. This field is used to declare numbered weeks of the year the schedule should run.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>17</Chip>
                <Chip disabled>43</Chip>
                <Chip disabled>52</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Annual weeks(s) number')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byminute`}
          placeholder={t('Select hours')}
          options={MINUTES_OF_HOUR}
          label={t('Minute(s) of hour')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byminute field. This field is used to declare minute(s) of the hour the schedule should run.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>1</Chip>
                <Chip disabled>37</Chip>
                <Chip disabled>59</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Minute(s) of hour')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byhour`}
          placeholder={t('Select hours')}
          options={HOURS_OF_DAY}
          label={t('Hour of day')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byhour field. This field is used to declare hours of day the schedule should run.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>0</Chip>
                <Chip disabled>7</Chip>
                <Chip disabled>18</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Hour of day')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonthday`}
          placeholder={t('Select days')}
          options={DAYS_OF_MONTH}
          label={t('Month day(s)')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bymonthday field. This field is used to declare ordinal days number of the month the schedule should run.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>1</Chip>
                <Chip disabled>15</Chip>
                <Chip disabled>28</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Month day(s)')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byyearday`}
          placeholder={t('Select days')}
          options={DAYS_OF_YEAR}
          label={t('Day(s) of Year')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byyearday field. This field is used to declare ordinal number days of the year the schedule should run. Do not use commas between the selected values'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>1</Chip>
                <Chip disabled>235</Chip>
                <Chip disabled>300</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Day(s) of Year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          placeholder={t('Select positions')}
          options={DAYS_OF_YEAR}
          name={`bysetpos`}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bysetpos field. Use this field to filter down recurrence instances within a single interval of the rule. See the iCalendar RFC for bysetpos field more information.'
                )}
              </div>
              <ChipGroup>
                <Chip disabled>1</Chip>
                <Chip disabled>235</Chip>
                <Chip disabled>300</Chip>
              </ChipGroup>
            </>
          }
          labelHelpTitle={t('Occurrences')}
          label={t('Occurrences')}
          disableSortOptions
        />
        <PageFormSingleSelect
          disableSortOptions
          name="endType"
          label={t('Schedule ending type')}
          placeholder={t('Method used to stop schedule')}
          options={[
            { value: 'never', label: t('Never'), description: t('Never ending schedule') },
            { value: 'count', label: t('Count'), description: t('Stop after a number of runs') },
            { value: 'until', label: t('Until'), description: t('Stop on a specific date') },
          ]}
          isRequired
        />
        {endType === 'count' && (
          <PageFormTextInput<RuleFields>
            labelHelpTitle={t('Count')}
            label={t('Count')}
            name={`count`}
            placeholder="5"
            labelHelp={t('The number of time this rule should be used.')}
            min={0}
            max={999}
            type="number"
            isRequired
          />
        )}

        {endType === 'until' && (
          <PageFormDateTimePicker<RuleFields>
            name={`until`}
            timePlaceHolder="HH:MM AM/PM"
            label={t('Until')}
            labelHelpTitle={t('Until')}
            labelHelp={t('Use this rule until the specified date/time')}
          />
        )}
      </PageFormSection>

      <ActionGroup className="pf-v5-u-pt-xl">
        <Button
          variant="secondary"
          data-cy={ruleId ? 'update-rule-button' : 'add-rule-button'}
          onClick={handleAddItem}
        >
          {ruleId
            ? t(isRulesStep ? 'Update rule' : 'Update exception')
            : t(isRulesStep ? 'Save rule' : 'Save exception')}
        </Button>
        <Button
          data-cy="discard-rule-button"
          variant="secondary"
          isDanger
          onClick={() => {
            const { rules = [], exceptions = [] } = getValues() as RuleFields;
            const ruleType: RuleType =
              props.title === t('Define rules') ? RuleType.Rules : RuleType.Exceptions;
            const ruleArray = ruleType === RuleType.Rules ? [...rules] : [...exceptions];
            reset({ ...defaultValues, [`${ruleType}`]: ruleArray }, { keepDefaultValues: true });
            props.setIsOpen(false);
          }}
        >
          {t('Discard')}
        </Button>
      </ActionGroup>
    </PageFormSection>
  );
}
