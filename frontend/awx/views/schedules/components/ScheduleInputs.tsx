import { useParams } from 'react-router-dom';
import { PageFormSelectOption, PageFormTextInput } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { ScheduleFormFields } from '../../../interfaces/ScheduleFormFields';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageFormJobTemplateSelect } from '../../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../../resources/templates/components/PageFormWorkflowJobTemplateSelect';
import { PageFormProjectSelect } from '../../../resources/projects/components/PageFormProjectSelect';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { PageFormInventorySourceSelect } from '../../../resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { useEffect, useState } from 'react';
import { RegularInventory } from '../../../interfaces/Inventory';
import { InventorySource } from '../../../interfaces/InventorySource';
import { Project } from '../../../interfaces/Project';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function ScheduleInputs(props: {
  timeZones: { value: string; label: string; key: string }[];
  zoneLinks?: { [key: string]: string };
  resourceForSchedule?: InventorySource | Project | JobTemplate | WorkflowJobTemplate;
}) {
  const { timeZones, zoneLinks } = props;
  const params = useParams();
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const resourceType = useWatch({
    name: 'resource_type',
  }) as string;
  const inventory = useWatch({ name: 'inventory' }) as RegularInventory;
  const timeZone = useWatch({ name: 'timezone' }) as string;
  const resourceForSchedule = useWatch({ name: 'unified_job_template' }) as
    | InventorySource
    | Project
    | JobTemplate
    | WorkflowJobTemplate;

  useEffect(() => {
    if (!props.resourceForSchedule) {
      return;
    }
    setValue('unified_job_template', props.resourceForSchedule);
    setValue('resource_type', props.resourceForSchedule?.type);
  }, [props.resourceForSchedule, setValue]);

  useEffect(() => {
    if (!zoneLinks) {
      return;
    }

    if (timeZone.length && zoneLinks[timeZone]) {
      setTimezoneMessage(
        t(`Warning: ${timeZone} is a link to ${zoneLinks[timeZone]} and will be saved as that.`)
      );
    } else {
      setTimezoneMessage('');
    }
  }, [timeZone, t, zoneLinks]);

  return (
    <>
      {params['*']?.startsWith('schedules') ? (
        <>
          <PageFormSelectOption<ScheduleFormFields>
            isRequired={!params['*']?.startsWith('schedules')}
            labelHelpTitle={t('Resource type')}
            labelHelp={t('Select a resource type onto which this schedule will be applied.')}
            name="resource_type"
            id="resource_type"
            label={t('Resource Type')}
            options={[
              { label: t('Job template'), value: 'job_template' },
              { label: t('Workflow job template'), value: 'workflow_job_template' },
              { label: t('Inventory source'), value: 'inventory_source' },
              { label: t('Project'), value: 'project' },
            ]}
            placeholderText={t('Select job type')}
          />

          {resourceType &&
            {
              job_template: <PageFormJobTemplateSelect name="unified_job_template" />,
              workflow_job_template: (
                <PageFormWorkflowJobTemplateSelect name="unified_job_template" />
              ),
              inventory_source: (
                <>
                  <PageFormInventorySelect
                    labelHelp={t(
                      'First, select the inventory to which the desired inventory source belongs.'
                    )}
                    name="inventory"
                    isRequired
                  />
                  {inventory?.id && (
                    <PageFormInventorySourceSelect
                      inventoryId={inventory?.id}
                      isRequired
                      name="unified_job_template"
                    />
                  )}
                </>
              ),
              project: <PageFormProjectSelect name="unified_job_template" />,
            }[resourceType]}
        </>
      ) : null}
      {resourceForSchedule ? (
        <>
          <PageFormTextInput name={'name'} isRequired label={t('Schedule Name')} />
          <PageFormTextInput name={'description'} label={t('Description')} />
          <PageFormDateTimePicker label={t('Start date/time')} name={'startDateTime'} />
          <PageFormSelectOption<ScheduleFormFields>
            name="timezone"
            placeholderText={t('Select time zone')}
            label={t('Time zone')}
            options={timeZones}
            helperText={timezoneMessage}
          />
        </>
      ) : null}
    </>
  );
}
