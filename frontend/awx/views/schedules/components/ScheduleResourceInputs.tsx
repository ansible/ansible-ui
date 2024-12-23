import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormDateTimePicker } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useGetTimezones } from '../hooks/useGetTimezones';
import { ScheduleFormWizard } from '../types';

export function ScheduleResourceInputs() {
  const { t } = useTranslation();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const [hasDaysToKeepField, setHasDaysToKeepField] = useState(false);
  const timeZone = useWatch<ScheduleFormWizard, 'timezone'>({ name: 'timezone' });
  const resourceId = useWatch<ScheduleFormWizard, 'resourceId'>({
    name: 'resourceId',
  });
  const scheduleType = useWatch<ScheduleFormWizard, 'schedule_type'>({
    name: 'schedule_type',
  });
  useEffect(() => {
    async function getManagementJob() {
      if (scheduleType === 'management_job_template' && resourceId) {
        const managementJob = await requestGet<SystemJobTemplate>(
          awxAPI`/system_job_templates/${resourceId.toString()}/`
        );
        if (
          managementJob?.job_type === 'cleanup_jobs' ||
          managementJob?.job_type === 'cleanup_activitystream'
        ) {
          setHasDaysToKeepField(true);
        } else {
          setHasDaysToKeepField(false);
        }
      }
    }
    void getManagementJob();
  }, [scheduleType, resourceId]);

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
          placeholder={t('Enter schedule name')}
          isRequired
          label={t('Schedule name')}
        />
        <PageFormTextInput<ScheduleFormWizard>
          name={'description'}
          placeholder={t('Enter description')}
          label={t('Description')}
        />
        <PageFormDateTimePicker<ScheduleFormWizard>
          label={t('Start date/time')}
          name="startDateTime"
          isRequired
        />
        <PageFormSingleSelect<ScheduleFormWizard>
          name="timezone"
          placeholder={t('Select time zone')}
          label={t('Time zone')}
          options={timeZones}
          helperText={timezoneMessage}
          isRequired
        />
        {hasDaysToKeepField && (
          <PageFormTextInput<ScheduleFormWizard>
            name={'schedule_days_to_keep'}
            isRequired
            placeholder={t('Enter days of data to keep')}
            label={t('Days of data to keep')}
            type="number"
            min={1}
          />
        )}
      </PageFormSection>
    </>
  );
}
