import { PageFormTextInput } from '@ansible/ansible-ui-framework';
import { Alert } from '@patternfly/react-core';
import { PageFormDateTimePicker } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormLabelSelect } from '../../../common/PageFormLabelSelect';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useGetTimezones } from '../hooks/useGetTimezones';
import { ScheduleFormWizard } from '../types';

export function ScheduleResourceInputs() {
  const { t } = useTranslation();
  const { unregister } = useFormContext<ScheduleFormWizard>();
  const { setWizardData } = usePageWizard<ScheduleFormWizard>();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const [hasDaysToKeepField, setHasDaysToKeepField] = useState(false);
  const timeZone = useWatch<ScheduleFormWizard, 'timezone'>({ name: 'timezone' });

  const resourceId = useWatch<ScheduleFormWizard, 'resourceId'>({
    name: 'resourceId',
  });
  const resource = useWatch<ScheduleFormWizard, 'resource'>({ name: 'resource' });
  const scheduleType = useWatch<ScheduleFormWizard, 'schedule_type'>({
    name: 'schedule_type',
  });
  const launchConfig = useWatch<ScheduleFormWizard, 'launch_config'>({ name: 'launch_config' });
  const labels = useWatch<ScheduleFormWizard, 'prompt.labels'>({ name: 'prompt.labels' });
  useEffect(() => {
    if (!labels) return;
    setWizardData((previous) => ({
      ...previous,
      prompt: { ...previous.prompt, labels },
    }));
  }, [setWizardData, labels]);
  const asksLabelsOnLaunch =
    launchConfig?.ask_labels_on_launch ??
    (resource && 'ask_labels_on_launch' in resource ? resource.ask_labels_on_launch : undefined);
  const organizationId =
    resource && 'summary_fields' in resource && 'organization' in resource.summary_fields
      ? resource.summary_fields.organization?.id
      : undefined;
  useEffect(() => {
    async function getManagementJob() {
      if (scheduleType === 'system_job_template' && resourceId) {
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
          unregister('schedule_days_to_keep');
        }
      }
    }
    void getManagementJob();
  }, [scheduleType, resourceId, resource, unregister]);

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
        {asksLabelsOnLaunch !== true ? (
          <>
            <PageFormLabelSelect<ScheduleFormWizard>
              name="prompt.labels"
              shouldUnregister={false}
              organizationId={organizationId}
              labelHelp={t(
                `Optional labels that describe this schedule, such as 'dev' or 'test'. Labels can be used to group and filter schedules.`
              )}
            />
            {labels && labels.length > 80 ? (
              <PageFormSection singleColumn>
                <Alert variant="warning" title={t('Many labels selected')} isInline>
                  {t(
                    'This schedule has {{count}} labels. Schedules support up to 100 labels; consider removing unused labels.',
                    { count: labels.length }
                  )}
                </Alert>
              </PageFormSection>
            ) : null}
          </>
        ) : null}
        {hasDaysToKeepField ? (
          <PageFormTextInput<ScheduleFormWizard>
            name={'schedule_days_to_keep'}
            isRequired
            placeholder={t('Enter days of data to keep')}
            label={t('Days of data to keep')}
            type="number"
            min={1}
          />
        ) : null}
      </PageFormSection>
    </>
  );
}
