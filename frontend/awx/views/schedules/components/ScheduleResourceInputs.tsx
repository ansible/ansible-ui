import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetTimezones } from '../hooks/useGetTimezones';
import { useEffect, useState } from 'react';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormTextInput } from '../../../../../framework';
import { ScheduleFormWizard } from '../types';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormSingleSelect } from '../../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function ScheduleResourceInputs() {
  const { t } = useTranslation();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const timeZone = useWatch({ name: 'timezone' }) as string;
  const resource = useWatch({
    name: 'resource',
  }) as SystemJobTemplate;
  const hasDaysToKeepField =
    resource?.name &&
    (resource.name.includes('Cleanup Activity Stream') ||
      resource.name.includes('Cleanup Job Details'));
  const { timeZones, links } = useGetTimezones();
  const endType = useWatch({ name: 'endType' }) as string;

  useEffect(() => {
    if (!links) {
      return;
    }

    if (timeZone?.length && links[timeZone]) {
      setTimezoneMessage(
        t(`Warning: ${timeZone} is a link to ${links[timeZone]} and will be saved as that.`)
      );
    } else {
      setTimezoneMessage('');
    }
  }, [timeZone, t, links]);

  return (
    <>
      <PageFormSection>
        <PageFormTextInput<ScheduleFormWizard>
          name={'name'}
          isRequired
          label={t('Schedule name')}
        />
        <PageFormTextInput<ScheduleFormWizard> name={'description'} label={t('Description')} />
        <PageFormDateTimePicker<ScheduleFormWizard>
          label={t('Start date/time')}
          name="startDateTime"
          isRequired
        />
        <PageFormSingleSelect<ScheduleFormWizard>
          name="timezone"
          placeholder={t('Select a time zone')}
          label={t('Time zone')}
          options={timeZones}
          helperText={timezoneMessage}
          isRequired
        />
        <PageFormSingleSelect
          disableSortOptions
          name="endType"
          label={t('Schedule ending type')}
          placeholder={t('Method used to stop schedule')}
          options={[
            { value: 'never', label: t('Never'), description: t('Never ending schedule') },
            { value: 'count', label: t('Count'), description: t('Stop after a number of runs') },
            { value: 'date', label: t('Until'), description: t('Stop on a specific date') },
          ]}
        />
        {endType === 'count' && (
          <PageFormTextInput<ScheduleFormWizard>
            labelHelpTitle={t('Count')}
            label={t('Count')}
            name={`count`}
            placeholder="5"
            labelHelp={t('The number of time this rule should be used.')}
            min={0}
            max={999}
            type="number"
          />
        )}
        {endType === 'date' && (
          <PageFormDateTimePicker<ScheduleFormWizard>
            name={`until`}
            timePlaceHolder="HH:MM AM/PM"
            label={t('Until')}
            labelHelpTitle={t('Until')}
            labelHelp={t('Use this rule until the specified date/time')}
          />
        )}
        {hasDaysToKeepField && (
          <PageFormTextInput<ScheduleFormWizard>
            name={'schedule_days_to_keep'}
            isRequired
            label={t('Days of data to keep')}
            type="number"
            min={1}
          />
        )}
      </PageFormSection>
    </>
  );
}
