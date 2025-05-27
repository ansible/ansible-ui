import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { mergeArraysByCredentialType } from '../../../access/credentials/hooks/mergeArraysByCredentialType';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Credential } from '../../../interfaces/Credential';
import { InventorySource } from '../../../interfaces/InventorySource';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { ScheduleFormWizard, ScheduleResources } from '../types';

/**
 *
 * @param {string}[resourceEndPoint] This used to fetch the resource to which the schedule belongs
 * @param {boolean}[isTopLevelSchedule] This is used to determine if we need to render the scheduleType
 * field and the resourceSelect field on the form.  If we did not get to the schedule create form from the top level
 * schedules list then we know which resource this schedule will belong to once it is created
 */

export function ScheduleSelectStep(props: {
  resourceEndPoint?: string;
  isTopLevelSchedule?: boolean;
}) {
  const isTopLevelScheduleForm = props.isTopLevelSchedule;
  const scheduleType = useWatch<ScheduleFormWizard, 'schedule_type'>({ name: 'schedule_type' });
  const resourceId = useWatch<ScheduleFormWizard, 'resourceId'>({ name: 'resourceId' });
  const resource = useWatch<ScheduleFormWizard, 'resource'>({ name: 'resource' });
  const params = useParams<{ id?: string; source_id: string; schedule_id?: string }>();
  const { setValue } = useFormContext();
  const { setStepData, setWizardData } = usePageWizard<ScheduleFormWizard>();

  // When the resource changes,
  // we need to set the promptStep default values to the launch configuration defaults
  useEffect(() => {
    if (!params?.id || props.resourceEndPoint === undefined) return;
    const getResource = async () => {
      let scheduleResource: ScheduleResources;
      if (params.source_id) {
        scheduleResource = await requestGet<InventorySource>(
          `${props.resourceEndPoint ?? ''}${params.source_id}/`
        );
      } else {
        scheduleResource = await requestGet<ScheduleResources>(
          `${props.resourceEndPoint ?? ''}${params?.id}/`
        );
      }
      setWizardData((prev) => ({
        ...prev,
        schedule_type: scheduleResource.type,
        resource: scheduleResource,
        resourceId: scheduleResource.id,
      }));
      setStepData((prev) => ({
        ...prev,
        details: {
          ...prev.details,
          schedule_type: scheduleResource.type,
          resource: scheduleResource,
          resourceId: scheduleResource.id,
        },
      }));
      setValue('resource', scheduleResource);
      setValue('resourceId', scheduleResource.id);
      setValue('schedule_type', scheduleResource.type);
    };

    void getResource();
  }, [params, resourceId, props.resourceEndPoint, setStepData, setWizardData, setValue]);

  useEffect(() => {
    async function updatePromptStep() {
      if (
        !resourceId ||
        (scheduleType !== 'job_template' && scheduleType !== 'workflow_job_template')
      ) {
        return;
      }
      const endPoint =
        scheduleType === 'job_template'
          ? awxAPI`/job_templates/${resourceId.toString()}/`
          : awxAPI`/workflow_job_templates/${resourceId.toString()}/`;
      const resource = await requestGet<ScheduleResources>(endPoint);
      const launchConfig = await requestGet<LaunchConfiguration>(`${endPoint}/launch/`);
      let credentials: Credential[] = [];
      if (launchConfig.ask_credential_on_launch && params.schedule_id) {
        const response = await requestGet<AwxItemsResponse<Credential>>(
          awxAPI`/schedules/${params.schedule_id}/credentials/`
        );
        credentials = response.results;
      }
      const defaults = launchConfig.defaults;
      const readOnlyLabels = defaults?.labels?.map((label) => ({
        ...label,
        isReadOnly: true,
      }));
      setStepData((prev) => {
        return {
          ...prev,
          promptStep: {
            ...prev.promptStep,
            prompt: {
              inventory: defaults?.inventory?.id ? defaults.inventory : null,
              credentials: mergeArraysByCredentialType(defaults?.credentials || [], credentials),
              execution_environment: defaults.execution_environment,
              instance_groups: defaults.instance_groups,
              diff_mode: defaults.diff_mode,
              scm_branch: defaults.scm_branch,
              extra_vars: defaults.extra_vars,
              forks: defaults.forks,
              job_slice_count: defaults.job_slice_count,
              job_tags: parseStringToTagArray(defaults.job_tags),
              job_type: defaults.job_type,
              labels: readOnlyLabels,
              limit: defaults.limit,
              skip_tags: parseStringToTagArray(defaults.skip_tags),
              timeout: defaults.timeout,
              verbosity: defaults.verbosity,
            },
            resource,
            launch_config: launchConfig,
          },
          details: { ...prev.details, resourceId, resource },
        };
      });

      setValue('schedule_type', scheduleType);
      setValue('launch_config', launchConfig);
    }
    void updatePromptStep();
  }, [props.resourceEndPoint, resourceId, scheduleType, setStepData, params.schedule_id, setValue]);
  return (
    <>
      {isTopLevelScheduleForm ? (
        <>
          <ScheduleTypeInputs />
          {(resourceId || resource?.id) && <ScheduleResourceInputs />}
        </>
      ) : (
        <ScheduleResourceInputs />
      )}
    </>
  );
}
