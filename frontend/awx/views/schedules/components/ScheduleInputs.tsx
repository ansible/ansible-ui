import { useParams } from 'react-router-dom';
import { PageFormSelectOption, PageFormTextInput } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { ScheduleFormFields } from '../../../interfaces/ScheduleFormFields';
import { useWatch } from 'react-hook-form';
import { PageFormJobTemplateSelect } from '../../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../../resources/templates/components/PageFormWorkflowJobTemplateSelect';
import { PageFormProjectSelect } from '../../../resources/projects/components/PageFormProjectSelect';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { RegularInventory } from '../../../interfaces/Inventory';
import { PageFormInventorySourceSelect } from '../../../resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormDateTimePicker } from '../../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { useEffect, useState } from 'react';

export function ScheduleInputs(props: {
  timeZones: { value: string; label: string; key: string }[];
  zoneLinks?: Record<string, string>;
}) {
  const { timeZones, zoneLinks } = props;
  const params = useParams();
  const { t } = useTranslation();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const resourceType = useWatch({ name: 'resource_type' }) as string;
  const inventory = useWatch({ name: 'inventory' }) as RegularInventory;
  const timeZone = useWatch({ name: 'timezone' }) as string;
  const resourceForSchedule = useWatch({ name: 'unified_job_template' }) as number;

  useEffect(() => {
    if (!zoneLinks) {
      return;
    }

    if (zoneLinks[timeZone]) {
      setTimezoneMessage(
        t(`Warning: ${timeZone} is a link to ${zoneLinks[timeZone]} and will be saved as that.`)
      );
    } else {
      setTimezoneMessage('');
    }
  }, [timeZone, t, zoneLinks]);

  return (
    <>
      {!params.resource_type ? (
        <PageFormSelectOption<ScheduleFormFields>
          isRequired={!params.resource_type}
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
      ) : null}
      {resourceType &&
        {
          job_template: (
            <PageFormJobTemplateSelect
              name="resourceName"
              jobTemplateIdPath="unified_job_template"
            />
          ),
          workflow_job_template: (
            <PageFormWorkflowJobTemplateSelect
              name="resourceName"
              workflowJobTemplateIdPath="unified_job_template"
            />
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
                  inventoryId={inventory.id}
                  isRequired
                  name="resourceName"
                  inventorySourceIdPath="unified_job_template"
                />
              )}
            </>
          ),
          project: <PageFormProjectSelect name="resourceName" project="unified_job_template" />,
        }[resourceType]}
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
