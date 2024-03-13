import { useWatch } from 'react-hook-form';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { Occurrence, ScheduleFormWizard } from '../types';
import { useTranslation } from 'react-i18next';
import { Frequency } from 'rrule';
import { useGetMonthOptions, useGetWeekdayOptions } from '../hooks/ruleHelpers';
import { PageFormMultiSelect } from '../../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import {
  FREQUENCIES_DEFAULT_VALUES,
  WEEKS_OF_YEAR,
  DAYS_OF_MONTH,
  DAYS_OF_YEAR,
  HOURS_OF_DAY,
  MINUTES_OF_HOUR,
} from '../wizard/constants';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { ActionGroup, Button } from '@patternfly/react-core';

export function OccurrencesForm(props: {
  isOpen: boolean;
  removeMap: (id: number) => void;
  addMap: (values: Occurrence) => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
  const frequencyOptions = Object.values(Frequency)
    .filter((freq) => isNaN(Number(freq)))
    .map((freq) => ({ name: freq, value: freq, label: freq.toString() }));

  const weekdayOptions = useGetWeekdayOptions();
  const occurrence = useWatch({ name: 'occurrences' }) as Occurrence;
  const monthOptions = useGetMonthOptions();
  return (
    <PageFormSection title={t('Define occurances')}>
      <PageFormSection>
        <PageFormSelect<ScheduleFormWizard>
          name={`occurrence.freq`}
          isRequired
          label={t('Frequency')}
          options={frequencyOptions}
        />
        <PageFormTextInput<ScheduleFormWizard>
          name={`occurrence.interval`}
          label={t('Interval')}
          type="number"
        />
        <PageFormSelect<ScheduleFormWizard>
          name={`occurrence.wkst`}
          label={t('Week Start')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          label={t('Weekdays')}
          name={`occurrence.byweekday`}
          options={weekdayOptions}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.bymonth`}
          label={t('Months')}
          options={monthOptions}
          labelHelpTitle={t('Months')}
          labelHelp={t(
            'This is the bymonth field. This field is used to declare which months of the year the schedule should run.'
          )}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks of the year on which to run the schedule')}
          label={t('Annual week(s) number')}
          labelHelp={t(
            'This is the byweekno field. This field is used to declare numbered weeks of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual weeks(s) number')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.byminute`}
          placeholder={t('Select minutes of the hour on which to run the schedule')}
          options={MINUTES_OF_HOUR}
          label={t('Minute(s) of hour')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare minute(s) of the hour the schedule should run.'
          )}
          labelHelpTitle={t('Minute(s) of hour')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.byhour`}
          placeholder={t('Select hour of day on which to run the schedule')}
          options={HOURS_OF_DAY}
          label={t('Hour of day')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare hours of day the schedule should run.'
          )}
          labelHelpTitle={t('Hour of day')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.bymonthday`}
          placeholder={t('Select days of the month on which to run the schedule')}
          options={DAYS_OF_MONTH}
          label={t('Monthly day(s) number')}
          labelHelp={t(
            'This is the bymonthday field. This field is used to declare numbered days of the month the schedule should run.'
          )}
          labelHelpTitle={t('Monthly day(s) number')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          name={`occurrence.byyearday`}
          placeholder={t('Select days of the year on which to run the schedule')}
          options={DAYS_OF_YEAR}
          label={t('Annual day(s) number')}
          labelHelp={t(
            'This is the byyearday field. This field is used to declare numbered days of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual day(s) number')}
        />
        <PageFormMultiSelect<ScheduleFormWizard>
          placeholder={t('Select days')}
          options={DAYS_OF_YEAR}
          name={`occurrence.bysetpos`}
          labelHelp={t(
            'Use this field to filter down indexed occurances based on those declared using the form fields in the Define occurances section. See the iCalendar RFC for bysetpos field more information.'
          )}
          labelHelpTitle={t('Occurance position')}
          label={t('Occurances')}
        />

        <PageFormTextInput<ScheduleFormWizard>
          labelHelpTitle={t('Count')}
          label={t('Count')}
          name={`occurrence.count`}
          labelHelp={t('The number of this rule should be used.')}
          min={0}
          type="number"
        />
        <PageFormDateTimePicker<ScheduleFormWizard>
          name={`occurrence.until`}
          timePlaceHolder="HH:MM AM/PM"
          label={t('Until')}
          labelHelpTitle={t('Until')}
          labelHelp={t('Use this rule until the specified date/time')}
        />
      </PageFormSection>

      <ActionGroup className="pf-v5-u-pt-xl">
        <Button
          variant="secondary"
          onClick={() => {
            props.addMap({
              ...FREQUENCIES_DEFAULT_VALUES,
              id: occurrence.id,
            });
            props.setIsOpen(false);
          }}
        >
          {t('Add')}
        </Button>
        <Button
          variant="secondary"
          isDanger
          onClick={() => {
            props.setIsOpen(false);
          }}
        >
          {t('Discard')}
        </Button>
      </ActionGroup>
    </PageFormSection>
  );
}
