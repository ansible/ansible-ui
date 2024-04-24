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
    resource &&
    (resource.name.includes('Cleanup Activity Stream') ||
      resource.name.includes('Cleanup Job Details'));
  const { timeZones, links } = useGetTimezones();

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
