import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PageFormSelect, PageFormTextInput } from '../../../../../framework';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { ScheduleFormWizard } from '../types';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { PageFormInventorySourceSelect } from '../../../resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../../resources/projects/components/PageFormProjectSelect';
import { PageFormJobTemplateSelect } from '../../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../../resources/templates/components/PageFormWorkflowJobTemplateSelect';
import { PageFormManagementJobsSelect } from '../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { Divider } from '@patternfly/react-core';
import { useGetTimezones } from '../hooks/useGetTimezones';

export function ScheduleInputs(props: { config: ScheduleFormWizard | object }) {
  const { config } = props;
  const params: { [string: string]: string } = useParams<{ id?: string; source_id?: string }>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { timeZones, links } = useGetTimezones();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const timeZone = useWatch({ name: 'timezone' }) as string;
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!links || !timeZone) {
      return;
    }

    if (timeZone?.length && links[timeZone]) {
      setTimezoneMessage(
        t(`Warning: ${timeZone} is a link to ${links[timeZone]} and will be saved as that.`)
      );
    } else {
      setTimezoneMessage('');
    }
  }, [timeZone, t, links, timeZones]);

  useEffect(() => {
    if ('unified_job_template_object' in config) {
      setValue('unified_job_template_object', config.unified_job_template_object);
      setValue('unified_job_template', config.unified_job_template);
      setValue('resource_type', config.resource_type);
      setValue('startDateTime', config.startDateTime);
      setValue('exceptions', config.exceptions);
      setValue('occurrences', config.occurrences);
      setValue('prompt', config.prompt);
      setValue('defaultInstanceGroups', config.defaultInstanceGroups);
      setValue('newInstanceGroups', config.newInstanceGroups);
      setValue('launch_config', config.launch_config);
    }
  }, [config, setValue]);

  return (
    <>
      {pathname.split('/')[1] === 'schedules' ? (
        <PageFormSection>
          <PageFormSelect<ScheduleFormWizard>
            isRequired={!params['*']?.startsWith('schedules')}
            labelHelpTitle={t('Resource type')}
            labelHelp={t('Select a resource type onto which this schedule will be applied.')}
            name="resource_type"
            id="resource_type"
            data-cy="resource-type"
            label={t('Resource Type')}
            options={[
              { label: t('Job template'), value: 'job_template' },
              { label: t('Workflow job template'), value: 'workflow_job_template' },
              { label: t('Inventory source'), value: 'inventory_source' },
              { label: t('Project'), value: 'project' },
              { label: t('Management job template'), value: 'management_job_template' },
            ]}
            fieldNameToResetOnFieldChange="unified_job_template_object"
            placeholderText={t('Select job type')}
          />

          {'inventory' in config &&
            config.resource_type &&
            {
              job_template: (
                <PageFormJobTemplateSelect<ScheduleFormWizard>
                  isRequired
                  name="unified_job_template_object"
                />
              ),
              workflow_job_template: (
                <PageFormWorkflowJobTemplateSelect<ScheduleFormWizard>
                  isRequired
                  name="unified_job_template_object"
                />
              ),
              inventory_source: (
                <>
                  <PageFormInventorySelect<ScheduleFormWizard>
                    isRequired
                    labelHelp={t(
                      'First, select the inventory to which the desired inventory source belongs.'
                    )}
                    name="inventory"
                  />
                  {config.inventory && (
                    <PageFormInventorySourceSelect<ScheduleFormWizard>
                      isRequired
                      inventoryId={config.inventory}
                      name="unified_job_template_object"
                    />
                  )}
                </>
              ),
              project: (
                <PageFormProjectSelect<ScheduleFormWizard>
                  isRequired
                  name="unified_job_template_object"
                />
              ),
              management_job_template: (
                <PageFormManagementJobsSelect<ScheduleFormWizard>
                  isRequired
                  name="unified_job_template_object"
                />
              ),
            }[config.resource_type]}
        </PageFormSection>
      ) : null}
      {'unified_job_template_object' in config && config.unified_job_template_object ? (
        <>
          <PageFormSection singleColumn>
            <Divider />
          </PageFormSection>
          <PageFormSection>
            <PageFormTextInput<ScheduleFormWizard>
              name={'name'}
              isRequired
              label={t('Schedule Name')}
            />
            <PageFormTextInput<ScheduleFormWizard> name={'description'} label={t('Description')} />
            <PageFormDateTimePicker<ScheduleFormWizard>
              label={t('Start date/time')}
              name={'startDateTime'}
            />
            <PageFormSelect<ScheduleFormWizard>
              name="timezone"
              placeholderText={t('Select time zone')}
              label={t('Time zone')}
              options={timeZones}
              helperText={timezoneMessage}
            />
          </PageFormSection>
        </>
      ) : null}
    </>
  );
}
