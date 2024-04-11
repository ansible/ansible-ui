import { useFormContext } from 'react-hook-form';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { RuleFields, RuleListItemType, RuleType, ScheduleFormWizard } from '../types';
import { useTranslation } from 'react-i18next';
import { RRule, datetime } from 'rrule';
import {
  useGetFrequencyOptions,
  useGetMonthOptions,
  useGetWeekdayOptions,
} from '../hooks/ruleHelpers';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import {
  WEEKS_OF_YEAR,
  DAYS_OF_MONTH,
  DAYS_OF_YEAR,
  HOURS_OF_DAY,
  MINUTES_OF_HOUR,
} from '../wizard/constants';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { ActionGroup, Button } from '@patternfly/react-core';
import { DateTime } from 'luxon';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useEffect } from 'react';
import { dateToInputDateTime } from '../../../../../framework/utils/dateTimeHelpers';

export function RuleForm(props: {
  title: string;
  isOpen: boolean | number;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  const {
    getValues,
    reset,
    formState: { defaultValues },
    setValue,
  } = useFormContext();
  const { activeStep, wizardData } = usePageWizard();
  const ruleId = typeof props.isOpen === 'number' && props.isOpen;

  const { timezone = 'America/New_York' } = wizardData as ScheduleFormWizard;
  const isRulesStep = activeStep && activeStep.id === 'rules';
  const weekdayOptions = useGetWeekdayOptions();
  const frequencyOptions = useGetFrequencyOptions();
  const monthOptions = useGetMonthOptions();

  useEffect(() => {
    if (ruleId) {
      const rules = getValues('rules') as RuleListItemType[];
      const ruleOptions = rules[rules.findIndex((r) => r.id === ruleId)].rule.options;
      const { until } = ruleOptions;

      if (until === null) return;
      const [date, time] = dateToInputDateTime(until?.toISOString() || '');
      reset({
        ...ruleOptions,
        until: {
          date,
          time,
        },
        rules,
      });
    }
  }, [getValues, reset, props.isOpen, timezone, ruleId]);
  const handleAddItem = () => {
    const {
      id,
      rules = [],
      exceptions = [],
      endingType,
      until,
      ...formData
    } = getValues() as RuleFields;

    const index = isRulesStep
      ? rules.findIndex((r) => r.id === ruleId)
      : exceptions.findIndex((r) => r.id === ruleId);
    const rule = new RRule(formData);
    if (until !== null) {
      const { time, date } = until;
      const isPM = time?.includes('PM');
      const [splithour = '', splitminute = ''] = (time || '').split(':');

      if (time && date) {
        const utcDate = DateTime.fromISO(`${date}`, { zone: timezone })
          .set({
            hour: isPM ? parseInt(splithour, 10) + 12 : parseInt(splithour, 10),
            minute: parseInt(splitminute, 10),
          })
          .toUTC();
        const { year, month, day, hour, minute } = utcDate;
        rule.options.until = datetime(year, month, day, hour, minute);
      } else {
        if (date) {
          // This block is used when the user enters a date, but no time.
          // We use the date given, and the current time based on the timezone given
          // in the first step, or default to America/New_York.

          const utcDate = DateTime.fromISO(`${date}`, { zone: timezone }).toUTC();
          const { year, day, month, hour, minute } = utcDate;
          rule.options.until = datetime(year, month, day, hour, minute);
        }
        if (time) {
          // This block is used when the user enters a time, but no date.
          // We use the time given, and the tomorrow's date based on the timezone given
          // in the first step, or default to America/New_York.

          const { year, day, month, hour, minute } = DateTime.now()
            .plus({ days: 1 })
            .set({
              hour: isPM ? parseInt(splithour, 10) + 12 : parseInt(`${splithour}`, 10),
              minute: parseInt(splitminute, 10),
            })
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

    reset({
      ...defaultValues,
      rules,
    });
    props.setIsOpen(false);
  };
  return (
    <PageFormSection title={props.title}>
      <PageFormSection>
        <PageFormSelect<RuleFields>
          name={`freq`}
          isRequired
          label={t('Frequency')}
          options={frequencyOptions}
        />
        <PageFormTextInput<RuleFields> name={`interval`} label={t('Interval')} type="number" />
        <PageFormSelect<RuleFields>
          name={`wkst`}
          label={t('Week Start')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<RuleFields>
          label={t('Weekdays')}
          name={`byweekday`}
          options={weekdayOptions}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonth`}
          label={t('Months')}
          options={monthOptions}
          labelHelpTitle={t('Months')}
          labelHelp={t(
            'This is the bymonth field. This field is used to declare which months of the year the schedule should run.'
          )}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks of the year on which to run the schedule')}
          label={t('Annual week(s) number')}
          labelHelp={t(
            'This is the byweekno field. This field is used to declare numbered weeks of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual weeks(s) number')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byminute`}
          placeholder={t('Select minutes of the hour on which to run the schedule')}
          options={MINUTES_OF_HOUR}
          label={t('Minute(s) of hour')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare minute(s) of the hour the schedule should run.'
          )}
          labelHelpTitle={t('Minute(s) of hour')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byhour`}
          placeholder={t('Select hour of day on which to run the schedule')}
          options={HOURS_OF_DAY}
          label={t('Hour of day')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare hours of day the schedule should run.'
          )}
          labelHelpTitle={t('Hour of day')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`bymonthday`}
          placeholder={t('Select days of the month on which to run the schedule')}
          options={DAYS_OF_MONTH}
          label={t('Monthly day(s) number')}
          labelHelp={t(
            'This is the bymonthday field. This field is used to declare numbered days of the month the schedule should run.'
          )}
          labelHelpTitle={t('Monthly day(s) number')}
        />
        <PageFormMultiSelect<RuleFields>
          name={`byyearday`}
          placeholder={t('Select days of the year on which to run the schedule')}
          options={DAYS_OF_YEAR}
          label={t('Annual day(s) number')}
          labelHelp={t(
            'This is the byyearday field. This field is used to declare numbered days of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual day(s) number')}
        />
        <PageFormMultiSelect<RuleFields>
          placeholder={t('Select days')}
          options={DAYS_OF_YEAR}
          name={`bysetpos`}
          labelHelp={t(
            'Use this field to filter down indexed occurances based on those declared using the form fields in the Define occurances section. See the iCalendar RFC for bysetpos field more information.'
          )}
          labelHelpTitle={t('Occurance position')}
          label={t('Occurances')}
        />

        <PageFormTextInput<RuleFields>
          labelHelpTitle={t('Count')}
          label={t('Count')}
          name={`count`}
          labelHelp={t('The number of this rule should be used.')}
          min={0}
          type="number"
        />
        <PageFormDateTimePicker<RuleFields>
          name={`until`}
          timePlaceHolder="HH:MM AM/PM"
          label={t('Until')}
          labelHelpTitle={t('Until')}
          labelHelp={t('Use this rule until the specified date/time')}
        />
      </PageFormSection>

      <ActionGroup className="pf-v5-u-pt-xl">
        <Button
          variant="secondary"
          data-cy={ruleId ? 'update-rule-button' : 'add-rule-button'}
          onClick={handleAddItem}
        >
          {ruleId ? t('Update') : t('Add')}
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
            reset({ ...defaultValues, [`${ruleType}`]: ruleArray });
            props.setIsOpen(false);
          }}
        >
          {t('Discard')}
        </Button>
      </ActionGroup>
    </PageFormSection>
  );
}
