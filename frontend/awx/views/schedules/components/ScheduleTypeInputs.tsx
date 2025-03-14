import { PageFormSelect } from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { Divider } from '@patternfly/react-core';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageFormManagementJobsSelect } from '../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { PageFormInventorySelect } from '../../../resources/inventories/components/PageFormInventorySelect';
import { PageFormInventorySourceSelect } from '../../../resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../../resources/projects/components/PageFormProjectSelect';
import { PageFormJobTemplateSelect } from '../../../resources/templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../../resources/templates/components/PageFormWorkflowJobTemplateSelect';
import { ScheduleFormWizard } from '../types';

export function ScheduleTypeInputs() {
  const { t } = useTranslation();
  const params: { [string: string]: string } = useParams<{ id?: string; source_id?: string }>();
  const { resetField } = useFormContext();

  const resourceInventory = useWatch({ name: 'resourceInventory' }) as number;
  const scheduleType = useWatch({
    name: 'schedule_type',
  }) as string;

  return (
    <>
      <PageFormSection>
        <PageFormSelect<ScheduleFormWizard>
          isRequired={!params['*']?.startsWith('schedules')}
          labelHelpTitle={t('Resource type')}
          labelHelp={t('Select a resource type onto which this schedule will be applied.')}
          name="schedule_type"
          id="schedule_type"
          data-cy="schedule-type"
          label={t('Resource type')}
          options={[
            { label: t('Job template'), value: 'job_template' },
            { label: t('Workflow job template'), value: 'workflow_job_template' },
            { label: t('Inventory source'), value: 'inventory_source' },
            { label: t('Project sync'), value: 'project' },
            { label: t('Management job template'), value: 'management_job_template' },
          ]}
          placeholderText={t('Select resource type')}
          onChange={() => {
            resetField('resourceId', { defaultValue: null });
          }}
        />

        {scheduleType &&
          {
            job_template: (
              <PageFormJobTemplateSelect<ScheduleFormWizard> isRequired name="resourceId" />
            ),
            workflow_job_template: (
              <PageFormWorkflowJobTemplateSelect<ScheduleFormWizard> isRequired name="resourceId" />
            ),
            inventory_source: (
              <>
                <PageFormInventorySelect<ScheduleFormWizard>
                  isRequired
                  labelHelp={t(
                    'First, select the inventory to which the desired inventory source belongs.'
                  )}
                  name="resourceInventory"
                />
                {resourceInventory ? (
                  <PageFormInventorySourceSelect<ScheduleFormWizard>
                    isRequired
                    inventoryId={resourceInventory}
                    name="resourceId"
                  />
                ) : null}
              </>
            ),
            project: <PageFormProjectSelect<ScheduleFormWizard> isRequired name="resourceId" />,
            management_job_template: (
              <PageFormManagementJobsSelect<ScheduleFormWizard> isRequired name="resourceId" />
            ),
          }[scheduleType]}
      </PageFormSection>
      <PageFormSection singleColumn>
        <Divider />
      </PageFormSection>
    </>
  );
}
