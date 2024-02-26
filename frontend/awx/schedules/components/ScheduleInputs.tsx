import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { PageFormSelect, PageFormTextInput } from '../../../../framework';
import { PageFormDateTimePicker } from '../../../../framework/PageForm/Inputs/PageFormDateTimePicker';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { requestGet } from '../../../common/crud/Data';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { awxAPI } from '../../common/api/awx-utils';
import { PageFormInventorySelect } from '../../infrastructure/inventories/components/PageFormInventorySelect';
import { PageFormInventorySourceSelect } from '../../infrastructure/inventories/components/PageFormInventorySourceSelect';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { RegularInventory } from '../../interfaces/Inventory';
import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { ScheduleFormFields } from '../../interfaces/ScheduleFormFields';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { PageFormProjectSelect } from '../../projects/components/PageFormProjectSelect';
import { PageFormJobTemplateSelect } from '../../templates/components/PageFormJobTemplateSelect';
import { PageFormWorkflowJobTemplateSelect } from '../../templates/components/PageFormWorkflowJobTemplateSelect';
import { resourceEndPoints, useGetPromptOnLaunchFields } from '../hooks/scheduleHelpers';

export function ScheduleInputs(props: {
  timeZones: { value: string; label: string; key: string }[];
  zoneLinks?: { [key: string]: string };
  onError: (err: Error) => void;
}) {
  const { timeZones, zoneLinks, onError } = props;
  const params: { [string: string]: string } = useParams<{ id: string; source_id?: string }>();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const [timezoneMessage, setTimezoneMessage] = useState('');
  const resourceType = useWatch({
    name: 'resource_type',
  }) as string;
  const launchConfiguration = useWatch({ name: 'launchConfiguration' }) as LaunchConfiguration;
  const inventory = useWatch({ name: 'inventory' }) as RegularInventory;
  const timeZone = useWatch({ name: 'timezone' }) as string;
  const resourceForSchedule = useWatch({ name: 'unified_job_template_object' }) as
    | InventorySource
    | Project
    | JobTemplate
    | WorkflowJobTemplate;
  useEffect(() => {
    if (!zoneLinks) {
      return;
    }

    if (timeZone?.length && zoneLinks[timeZone]) {
      setTimezoneMessage(
        t(`Warning: ${timeZone} is a link to ${zoneLinks[timeZone]} and will be saved as that.`)
      );
    } else {
      setTimezoneMessage('');
    }
  }, [timeZone, t, zoneLinks]);

  const promptOnLaunchFields = useGetPromptOnLaunchFields(resourceForSchedule);

  useEffect(() => {
    const resource = async () => {
      if (resourceForSchedule || !params?.id) {
        return;
      }

      try {
        const response = await requestGet<
          Project | JobTemplate | WorkflowJobTemplate | InventorySource
        >(`${resourceEndPoints[pathname.split('/')[2]]}${params?.id}/`);
        setValue('unified_job_template_object', response);
        setValue('unified_job_template', response.id);
      } catch (err) {
        if (err instanceof Error) {
          onError(err);
        }
      }
    };

    void resource();
  }, [params, pathname, resourceForSchedule, setValue, onError]);

  useEffect(() => {
    const getDefaultInstanceGroups = async (url: string) => {
      return requestGet<AwxItemsResponse<InstanceGroup>>(`${url}`)
        .then((response) => {
          setValue('defaultInstanceGroups', response.results);
          setValue('newInstanceGroups', response.results);
        })
        .catch((err) => {
          if (err instanceof Error) {
            onError(err);
          }
        });
    };

    if (launchConfiguration && launchConfiguration?.ask_instance_groups_on_launch) {
      if (pathname.split('/').includes('job_template')) {
        void getDefaultInstanceGroups(
          awxAPI`/job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
        );
      }
      if (pathname.split('/').includes('workflow_ job_template')) {
        void getDefaultInstanceGroups(
          awxAPI`/workflow_job_templates/${launchConfiguration.job_template_data.id.toString()}/instance_groups/`
        );
      }
    }
  }, [launchConfiguration, params.id, pathname, onError, setValue]);

  const launchConfig = useCallback(
    async (id: string, resource_type: string) => {
      return requestGet<LaunchConfiguration>(`${resourceEndPoints[resource_type]}${id}/launch/`)
        .then((response) => {
          setValue('launchConfiguration', response);
          setValue('defaultLabels', response.defaults.labels);
          setValue('labels', response.defaults.labels);
          setValue('credentials', response.defaults.credentials);
          setValue('newCredentials', response.defaults.credentials);
          setValue('extra_vars', response.defaults.extra_vars);
          setValue('limit', response.defaults.limit);
          setValue('diff_mode', response.defaults.diff_mode);
          setValue('scm_branch', response.defaults.scm_branch);
          setValue('forks', response.defaults.forks);
          setValue('job_slice_count', response.defaults.job_slice_count);
          setValue('timeout', response.defaults.timeout);
          setValue('verbosity', response.defaults.verbosity);
          setValue('job_type', response.defaults.job_type);
          setValue('inventory', response.defaults.inventory);
          if (JSON.stringify(response.defaults.execution_environment) !== '{}') {
            setValue('execution_environment', {
              ...response?.defaults?.execution_environment,
            });
          }
          if (response.defaults.skip_tags) {
            setValue(
              'arrayedSkipTags',
              response.defaults.skip_tags.split(',')?.map((tag) => ({ name: tag }))
            );
          }
          if (response.defaults.job_tags) {
            setValue(
              'arrayedJobTags',
              response.defaults.job_tags.split(',')?.map((tag) => ({ name: tag }))
            );
          }
        })
        .catch((err) => {
          if (err instanceof Error) {
            onError(err);
          }
        });
    },
    [onError, setValue]
  );

  useEffect(() => {
    const resType = resourceType ?? pathname.split('/')[2];
    if (
      (resType !== 'job_template' && resType !== 'workflow_job_template') ||
      (!resourceForSchedule?.id && !params?.id)
    )
      return;
    if (resourceForSchedule?.id) {
      void launchConfig(resourceForSchedule.id.toString(), resType);
      return;
    }
    void launchConfig(params.id, resType);
  }, [launchConfig, pathname, resourceForSchedule?.id, params.id, resourceType]);

  return (
    <>
      {pathname.split('/')[2] === 'schedules' ? (
        <>
          <PageFormSelect<ScheduleFormFields>
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
            fieldNameToResetOnFieldChange="unified_job_template_object"
            placeholderText={t('Select job type')}
          />

          {resourceType &&
            {
              job_template: <PageFormJobTemplateSelect name="unified_job_template_object" />,
              workflow_job_template: (
                <PageFormWorkflowJobTemplateSelect name="unified_job_template_object" />
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
                      name="unified_job_template_object"
                    />
                  )}
                </>
              ),
              project: <PageFormProjectSelect name="unified_job_template_object" />,
            }[resourceType]}
        </>
      ) : null}
      {resourceForSchedule ? (
        <>
          <PageFormTextInput name={'name'} isRequired label={t('Schedule Name')} />
          <PageFormTextInput name={'description'} label={t('Description')} />
          <PageFormDateTimePicker<ScheduleFormFields>
            label={t('Start date/time')}
            name={'startDateTime'}
          />
          <PageFormSelect<ScheduleFormFields>
            name="timezone"
            placeholderText={t('Select time zone')}
            label={t('Time zone')}
            options={timeZones}
            helperText={timezoneMessage}
          />
          {promptOnLaunchFields?.length ? (
            <PageFormSection title={t('Prompt on launch fields')}>
              {promptOnLaunchFields.map((field) => field)}
            </PageFormSection>
          ) : null}
        </>
      ) : null}
    </>
  );
}
