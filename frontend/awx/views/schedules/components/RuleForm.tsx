import { PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormDateTimePicker } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { ActionGroup, Button } from '@patternfly/react-core';

import { DateTime } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RRule, datetime } from 'rrule';
import {
  ensureUntilZSuffix,
  useGetFrequencyOptions,
  useGetMonthOptions,
  useGetWeekdayOptions,
} from '../hooks/ruleHelpers';
import { useGet24HourTime } from '../hooks/useGet24HourTime';
import { RuleFields, RuleType, ScheduleFormWizard } from '../types';
import {
  DAYS_OF_MONTH,
  DAYS_OF_YEAR,
  HOURS_OF_DAY,
  MINUTES_OF_HOUR,
  WEEKS_OF_YEAR,
} from '../wizard/constants';

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
  const isRulesStep = activeStep?.id === 'rules';
  const weekdayOptions = useGetWeekdayOptions();
  const frequencyOptions = useGetFrequencyOptions();
  const monthOptions = useGetMonthOptions();

  const handleAddItem = () => {
    const values = getValues() as RuleFields;
    delete values.endType;
    delete values.id;
    const { rules = [], exceptions = [], endType, until = null, ...rest } = values;
    const start = DateTime.fromISO(`${date}`).set(get24Hour(time));
    const { year, month, day, hour, minute } = start;
    const dateString = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;
    const rrulestring = `DTSTART;TZID=${timezone}:${dateString}`;
    const ruleStart = RRule.fromString(rrulestring);
    const rule = new RRule({ ...ruleStart.options, ...rest });
    if (until !== null) {
      const untilTime = until?.time;
      const untilDate = until?.date;
      if (untilDate && untilTime) {
        const utcDate = DateTime.fromISO(`${untilDate}`, { zone: timezone })
          .set(get24Hour(untilTime))
          .toUTC();
        const { year, month, day, hour, minute } = utcDate;
        rule.origOptions.until = datetime(year, month, day, hour, minute);
      } else {
        if (untilDate) {
          // This block is used when the user enters a date, but no time.
          // We use midnight in the schedule's timezone, not browser timezone.

          const utcDate = DateTime.fromISO(`${untilDate}`, { zone: timezone })
            .startOf('day')
            .toUTC();
          const { year, day, month, hour, minute } = utcDate;
          rule.origOptions.until = datetime(year, month, day, hour, minute);
        }
        if (untilTime) {
          // This block is used when the user enters a time, but no date.
          // We use tomorrow's date in the schedule's timezone, not browser timezone.

          const { year, day, month, hour, minute } = DateTime.now()
            .setZone(timezone)
            .plus({ days: 1 })
            .set(get24Hour(untilTime))
            .toUTC();

          rule.origOptions.until = datetime(year, month, day, hour, minute);
        }
      }
    }

    const newItemId = isRulesStep ? rules.length + 1 : exceptions.length + 1;
    const itemId = ruleId || newItemId;
    const ruleObject = {
      rule: ensureUntilZSuffix(RRule.optionsToString({ ...rule.origOptions })),
      id: itemId,
    };
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
          placeholderText={t('Select frequency')}
          labelHelp={[t('Enter how frequently the schedule runs.')]}
          options={frequencyOptions}
        />
        <PageFormTextInput<RuleFields>
          labelHelp={[t('Enter the interval for the schedule.')]}
          name={`interval`}
          label={t('Interval')}
          type="number"
        />
        <PageFormSelect<RuleFields>
          name={`wkst`}
          label={t('Week start')}
          placeholderText={t('Select start day')}
          labelHelp={t('Select the day of the week that you want the week to begin.')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byminute`}
          placeholder={t('Select minutes of the hour')}
          options={MINUTES_OF_HOUR}
          label={t('Minutes of the hour')}
          labelHelp={t('Select the minute(s) of the hour that the schedule should run.')}
          labelHelpTitle={t('Minutes of the hour')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byhour`}
          placeholder={t('Select hours of the day')}
          options={HOURS_OF_DAY}
          label={t('Hours of the day')}
          labelHelp={t('Select the hours of day that the schedule should run.')}
          labelHelpTitle={t('Hours of the day')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          label={t('Days of the week')}
          name={`byweekday`}
          options={weekdayOptions}
          placeholder={t('Select days of the week')}
          labelHelp={t('Select the days of the week on which to run the schedule.')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonthday`}
          placeholder={t('Select days of the month')}
          options={DAYS_OF_MONTH}
          label={t('Days of the month')}
          labelHelp={t('Select the days of the month on which the schedule should run.')}
          labelHelpTitle={t('Days of the month')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks of the year')}
          label={t('Weeks of the year')}
          labelHelp={t('Select the numbered weeks of the year that the schedule should run.')}
          labelHelpTitle={t('Weeks of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonth`}
          label={t('Months of the year')}
          options={monthOptions}
          labelHelpTitle={t('Months of the year')}
          labelHelp={t('Select the months of the year on which to run the schedule.')}
          placeholder={t('Select months of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byyearday`}
          placeholder={t('Select days of the year')}
          options={DAYS_OF_YEAR}
          label={t('Days of the year')}
          labelHelp={t('Select the days of the year on which the schedule should run.')}
          labelHelpTitle={t('Days of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          placeholder={t('Select occurrences')}
          options={DAYS_OF_YEAR}
          name={`bysetpos`}
          labelHelp={t(
            'Filter which occurrences to include within each recurrence interval. Use positive numbers (1, 2, 3...) to select from the beginning, or negative numbers (-1, -2, -3...) to select from the end. For example, with a monthly schedule: 1 = first occurrence of the month, -1 = last occurrence of the month.'
          )}
          labelHelpTitle={t('Occurrences')}
          label={t('Occurrences')}
          disableSortOptions
        />
        <PageFormSingleSelect
          disableSortOptions
          name="endType"
          label={t('Schedule ending type')}
          labelHelp={t('Select the ending type for the schedule.')}
          placeholder={t('Select schedule ending type')}
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

      <ActionGroup className="pf-v6-u-pt-xl">
        <Button
          variant="secondary"
          data-cy={ruleId ? 'update-rule-button' : 'add-rule-button'}
          data-testid={ruleId ? 'update-rule-button' : 'add-rule-button'}
          onClick={handleAddItem}
        >
          {ruleId
            ? t(isRulesStep ? 'Update rule' : 'Update exception')
            : t(isRulesStep ? 'Save rule' : 'Save exception')}
        </Button>
        <Button
          data-cy="discard-rule-button"
          data-testid="discard-rule-button"
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
