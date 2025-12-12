import { PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormDateTimePicker } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { Label, LabelGroup, ActionGroup, Button } from '@patternfly/react-core';

import { DateTime } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RRule, datetime } from 'rrule';
import {
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
  const isRulesStep = activeStep && activeStep.id === 'rules';
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
        const utcDate = DateTime.fromISO(`${untilDate}`).set(get24Hour(untilTime)).toUTC();
        const { year, month, day, hour, minute } = utcDate;
        rule.origOptions.until = datetime(year, month, day, hour, minute);
      } else {
        if (untilDate) {
          // This block is used when the user enters a date, but no time.
          // We use the date given, and the current time based on the timezone given
          // in the first step, or default to America/New_York.

          const utcDate = DateTime.fromISO(`${untilDate}`).toUTC();
          const { year, day, month, hour, minute } = utcDate;
          rule.origOptions.until = datetime(year, month, day, hour, minute);
        }
        if (untilTime) {
          // This block is used when the user enters a time, but no date.
          // We use the time given, and the tomorrow's date based on the timezone given
          // in the first step, or default to America/New_York.

          const { year, day, month, hour, minute } = DateTime.now()
            .plus({ days: 1 })
            .set(get24Hour(untilTime))
            .toUTC();

          rule.origOptions.until = datetime(year, month, day, hour, minute);
        }
      }
    }

    const itemId = ruleId
      ? ruleId
      : isRulesStep
        ? rules.length + 1 || 1
        : exceptions.length + 1 || 1;
    const ruleObject = { rule: RRule.optionsToString({ ...rule.origOptions }), id: itemId };
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
          labelHelp={[
            t(
              'This is the freq field. Select how often the schedule runs. For example, if the frequency is yearly, and the interval is 8, the schedule will run every 8 years.'
            ),
          ]}
          options={frequencyOptions}
        />
        <PageFormTextInput<RuleFields>
          labelHelp={[
            t('This is the interval field. Select the interval at which the rule will repeat.'),
          ]}
          name={`interval`}
          label={t('Interval')}
          type="number"
        />
        <PageFormSelect<RuleFields>
          name={`wkst`}
          label={t('Week start')}
          placeholderText={t('Select start day')}
          labelHelp={t(
            'This is the wkst field. Select the day of the week that the schedule will start.'
          )}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byminute`}
          placeholder={t('Select minutes of the hour')}
          options={MINUTES_OF_HOUR}
          label={t('Minutes of the hour')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byminute field. Select the minutes of each hour that the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  1
                </Label>
                <Label variant="outline" disabled>
                  37
                </Label>
                <Label variant="outline" disabled>
                  59
                </Label>
              </LabelGroup>
            </>
          }
          labelHelpTitle={t('Minutes of the hour')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byhour`}
          placeholder={t('Select hours of the day')}
          options={HOURS_OF_DAY}
          label={t('Hours of the day')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byhour field. Select the hours of each day that the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  0
                </Label>
                <Label variant="outline" disabled>
                  7
                </Label>
                <Label variant="outline" disabled>
                  18
                </Label>
              </LabelGroup>
            </>
          }
          labelHelpTitle={t('Hours of the day')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          label={t('Days of the week')}
          name={`byweekday`}
          options={weekdayOptions}
          placeholder={t('Select days of the week')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byweekday field. Select days of the week on which the run will schedule.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  {t('Sunday')}
                </Label>
                <Label variant="outline" disabled>
                  {t('Wednesday')}
                </Label>
                <Label variant="outline" disabled>
                  {t('Friday')}
                </Label>
              </LabelGroup>
            </>
          }
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonthday`}
          placeholder={t('Select days of the month')}
          options={DAYS_OF_MONTH}
          label={t('Days of the month')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bymonthday field. Select the numerical days of each month on which the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  1
                </Label>
                <Label variant="outline" disabled>
                  15
                </Label>
                <Label variant="outline" disabled>
                  28
                </Label>
              </LabelGroup>
            </>
          }
          labelHelpTitle={t('Days of the month')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks of the year')}
          label={t('Weeks of the year')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byweekno field. Select the numerical weeks of the year on which the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  17
                </Label>
                <Label variant="outline" disabled>
                  43
                </Label>
                <Label variant="outline" disabled>
                  52
                </Label>
              </LabelGroup>
            </>
          }
          labelHelpTitle={t('Weeks of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonth`}
          label={t('Months of the year')}
          options={monthOptions}
          labelHelpTitle={t('Months of the year')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bymonth field. Select the months of the year that the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  {t('June')}
                </Label>
                <Label variant="outline" disabled>
                  {t('August')}
                </Label>
                <Label variant="outline" disabled>
                  {t('January')}
                </Label>
              </LabelGroup>
            </>
          }
          placeholder={t('Select months of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          name={`byyearday`}
          placeholder={t('Select days of the year')}
          options={DAYS_OF_YEAR}
          label={t('Days of the year')}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the byyearday field. Select the numerical days of the year that the schedule will run.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  1
                </Label>
                <Label variant="outline" disabled>
                  235
                </Label>
                <Label variant="outline" disabled>
                  300
                </Label>
              </LabelGroup>
            </>
          }
          labelHelpTitle={t('Days of the year')}
          disableSortOptions
        />
        <PageFormMultiSelect<RuleFields>
          placeholder={t('Select occurrences')}
          options={DAYS_OF_YEAR}
          name={`bysetpos`}
          labelHelp={
            <>
              <div>
                {t(
                  'This is the bysetpos field. Use this field to filter recurrence instances within a single interval of the exception. See the iCalendar RFC for bysetpos field more information.'
                )}
              </div>
              <LabelGroup>
                <Label variant="outline" disabled>
                  1
                </Label>
                <Label variant="outline" disabled>
                  235
                </Label>
                <Label variant="outline" disabled>
                  300
                </Label>
              </LabelGroup>
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
