import { useTranslation } from 'react-i18next';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { Frequency } from 'rrule';
import { useGetMonthOptions, useGetWeekdayOptions } from '../hooks/ruleHelpers';
import { Banner, Divider, Tooltip } from '@patternfly/react-core';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { RuleFormFields } from '../RuleForm';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';

export function RuleInputs() {
  const { t } = useTranslation();
  const frequencyOptions = Object.values(Frequency)
    .filter((freq) => isNaN(Number(freq)))
    .map((freq, i) => ({ name: freq, value: i, label: freq.toString() }));

  const weekdayOptions = useGetWeekdayOptions();
  const weeksOfYear = Array.from({ length: 52 }, (_, i) => i + 1).map((week) => ({
    value: week,
    label: `${week}`,
  }));
  const daysOfYear = Array.from({ length: 366 }, (_, i) => i + 1).map((day) => ({
    value: day,
    label: `${day}`,
  }));

  const monthOptions = useGetMonthOptions();

  return (
    <>
      <Tooltip
        content={
          <b>
            {t(
              'The Start date/time and Timezone are global properties for this schedule and are shown for reference only.'
            )}
          </b>
        }
      >
        <Banner variant="info" title={t('Schedule rules')} className="pf-m-12-col">
          <b>
            {t(
              'The Start date/time and Timezone are global properties for this schedule and are shown for reference only.'
            )}
          </b>
        </Banner>
      </Tooltip>
      <PageFormDateTimePicker<RuleFormFields>
        label={t('Start date/time')}
        isDisabled
        name={'startDateTime'}
      />
      <PageFormTextInput<RuleFormFields> name="timezone" isDisabled label={t('Timezone')} />
      <Divider className="pf-m-12-col" />
      <PageFormSection title={t('Define occurances')}>
        <PageFormSelect<RuleFormFields>
          name="freq"
          isRequired
          label={t('Frequency')}
          options={frequencyOptions}
        />
        <PageFormTextInput<RuleFormFields> name="interval" label={t('Interval')} type="number" />
        <PageFormSelect<RuleFormFields>
          name="wkst"
          label={t('Week Start')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<RuleFormFields>
          label={t('Weekdays')}
          name="byweekday"
          options={weekdayOptions}
          placeholderText={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<RuleFormFields>
          name="bymonth"
          label={t('Months')}
          options={monthOptions}
          labelHelpTitle={t('Months')}
          labelHelp={t(
            'This is the bymonth field.  This field is used to declare which months of the year the schedule should run.'
          )}
          placeholderText={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<RuleFormFields>
          name="byweekno"
          options={weeksOfYear}
          placeholderText={t('Select weeks of the year on which to run the schedule')}
          label={t('Annual week(s) number')}
          labelHelp={t(
            'This is the byweekno field.  This field is used to declare numbered weeks of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual weeks(s) number')}
        />
        <PageFormMultiSelect<RuleFormFields>
          name="byyearday"
          placeholderText={t('Select days of the year on which to run the schedule')}
          options={daysOfYear}
          label={t('Annual day(s) number')}
          labelHelp={t(
            'This is the byyearday field.  This field is used to declare numbered days of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual day(s) number')}
        />
        <PageFormMultiSelect<RuleFormFields>
          options={daysOfYear}
          name="bysetpos"
          labelHelp={t(
            'Use this field to filter down indexed occurances based on those declared using the form fields in the Define occurances section.  See the iCalendar RFC for bysetpos field more information.'
          )}
          labelHelpTitle={t('Occurance position')}
          label={t('Occurances')}
        />
      </PageFormSection>
      <Divider className="pf-m-12-col" />
      <PageFormSection>
        <PageFormTextInput<RuleFormFields>
          labelHelpTitle={t('Count')}
          label={t('Count')}
          name="count"
          labelHelp={t('The number of this rule should be used.')}
          min={0}
          type="number"
        />
        <PageFormDateTimePicker<RuleFormFields>
          name="until"
          label={t('Until')}
          labelHelpTitle={t('Until')}
          labelHelp={t('Use this rule until the specified date/time')}
        />
      </PageFormSection>
    </>
  );
}
