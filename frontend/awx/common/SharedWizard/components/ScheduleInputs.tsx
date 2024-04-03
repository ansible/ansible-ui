import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetTimezones } from '../../../views/schedules/hooks/useGetTimezones';
import { useWatch } from 'react-hook-form';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { Divider } from '@patternfly/react-core';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { ScheduleFormWizard } from '../../../views/schedules/types';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';

export function ScheduleInputs() {
  const { t } = useTranslation();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const timeZone = useWatch({ name: 'timezone' }) as string;
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
      <PageFormSection singleColumn>
        <Divider />
      </PageFormSection>
      <PageFormSection>
        <PageFormTextInput<ScheduleFormWizard>
          name={'name'}
          isRequired
          label={t('Schedule name')}
        />
        <PageFormTextInput<ScheduleFormWizard> name={'description'} label={t('Description')} />
        <PageFormDateTimePicker<ScheduleFormWizard>
          label={t('Start date/time')}
          name={'startDateTime'}
          isRequired
        />
        <PageFormSelect<ScheduleFormWizard>
          name="timezone"
          placeholderText={t('Select time zone')}
          label={t('Time zone')}
          options={timeZones}
          helperText={timezoneMessage}
          isRequired
        />
      </PageFormSection>
    </>
  );
}
