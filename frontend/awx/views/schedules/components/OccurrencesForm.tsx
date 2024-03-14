import { useFormContext } from 'react-hook-form';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { OccurrenceFields } from '../types';
import { useTranslation } from 'react-i18next';
import { RRule } from 'rrule';
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

export function OccurrencesForm(props: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) {
  const { t } = useTranslation();
  const { getValues, reset } = useFormContext();

  const weekdayOptions = useGetWeekdayOptions();
  const frequencyOptions = useGetFrequencyOptions();
  const monthOptions = useGetMonthOptions();

  return (
    <PageFormSection title={t('Define occurances')}>
      <PageFormSection>
        <PageFormSelect<OccurrenceFields>
          name={`freq`}
          isRequired
          label={t('Frequency')}
          options={frequencyOptions}
        />
        <PageFormTextInput<OccurrenceFields>
          name={`interval`}
          label={t('Interval')}
          type="number"
        />
        <PageFormSelect<OccurrenceFields>
          name={`wkst`}
          label={t('Week Start')}
          options={weekdayOptions}
        />
        <PageFormMultiSelect<OccurrenceFields>
          label={t('Weekdays')}
          name={`byweekday`}
          options={weekdayOptions}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`bymonth`}
          label={t('Months')}
          options={monthOptions}
          labelHelpTitle={t('Months')}
          labelHelp={t(
            'This is the bymonth field. This field is used to declare which months of the year the schedule should run.'
          )}
          placeholder={t('Select days of the week on which to run the schedule')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`byweekno`}
          options={WEEKS_OF_YEAR}
          placeholder={t('Select weeks of the year on which to run the schedule')}
          label={t('Annual week(s) number')}
          labelHelp={t(
            'This is the byweekno field. This field is used to declare numbered weeks of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual weeks(s) number')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`byminute`}
          placeholder={t('Select minutes of the hour on which to run the schedule')}
          options={MINUTES_OF_HOUR}
          label={t('Minute(s) of hour')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare minute(s) of the hour the schedule should run.'
          )}
          labelHelpTitle={t('Minute(s) of hour')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`byhour`}
          placeholder={t('Select hour of day on which to run the schedule')}
          options={HOURS_OF_DAY}
          label={t('Hour of day')}
          labelHelp={t(
            'This is the byhour field. This field is used to declare hours of day the schedule should run.'
          )}
          labelHelpTitle={t('Hour of day')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`bymonthday`}
          placeholder={t('Select days of the month on which to run the schedule')}
          options={DAYS_OF_MONTH}
          label={t('Monthly day(s) number')}
          labelHelp={t(
            'This is the bymonthday field. This field is used to declare numbered days of the month the schedule should run.'
          )}
          labelHelpTitle={t('Monthly day(s) number')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          name={`byyearday`}
          placeholder={t('Select days of the year on which to run the schedule')}
          options={DAYS_OF_YEAR}
          label={t('Annual day(s) number')}
          labelHelp={t(
            'This is the byyearday field. This field is used to declare numbered days of the year the schedule should run.'
          )}
          labelHelpTitle={t('Annual day(s) number')}
        />
        <PageFormMultiSelect<OccurrenceFields>
          placeholder={t('Select days')}
          options={DAYS_OF_YEAR}
          name={`bysetpos`}
          labelHelp={t(
            'Use this field to filter down indexed occurances based on those declared using the form fields in the Define occurances section. See the iCalendar RFC for bysetpos field more information.'
          )}
          labelHelpTitle={t('Occurance position')}
          label={t('Occurances')}
        />

        <PageFormTextInput<OccurrenceFields>
          labelHelpTitle={t('Count')}
          label={t('Count')}
          name={`count`}
          labelHelp={t('The number of this rule should be used.')}
          min={0}
          type="number"
        />
        <PageFormDateTimePicker<OccurrenceFields>
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
          onClick={() => {
            const { rules, endDate, endTime, endingType, ...stepData } =
              getValues() as OccurrenceFields;
            const rule = new RRule(stepData);
            const ruleId = rules?.length + 1 || 1;
            reset({ rules: [...(rules || []), { rule, id: ruleId }] }, { keepDefaultValues: true });
            props.setIsOpen(false);
          }}
        >
          {t('Add')}
        </Button>
        <Button
          variant="secondary"
          isDanger
          onClick={() => {
            reset({ keepDefaultValues: true });
            props.setIsOpen(false);
          }}
        >
          {t('Discard')}
        </Button>
      </ActionGroup>
    </PageFormSection>
  );
}
