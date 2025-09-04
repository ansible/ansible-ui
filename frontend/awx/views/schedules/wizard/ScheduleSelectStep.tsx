import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Credential } from '../../../interfaces/Credential';
import { InventorySource } from '../../../interfaces/InventorySource';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { useGetSchedulePromptValues } from '../hooks/useGetSchedulePromptValues';
import { ScheduleFormWizard, ScheduleResources } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { Survey } from '../../../interfaces/Survey';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Label } from '../../../interfaces/Label';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';

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
  const { id, source_id, schedule_id } = useParams<{
    id?: string;
    source_id: string;
    schedule_id?: string;
  }>();
  const { setValue } = useFormContext();
  const { setStepData, setWizardData } = usePageWizard<ScheduleFormWizard>();
  const getSchedulePromptValues = useGetSchedulePromptValues();
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();

  // When the resource changes,
  // we need to set the promptStep default values to the launch configuration defaults
  useEffect(() => {
    if (!id || props.resourceEndPoint === undefined) return;
    const getResource = async () => {
      try {
        let scheduleResource: ScheduleResources;
        if (source_id) {
          scheduleResource = await requestGet<InventorySource>(
            `${props.resourceEndPoint ?? ''}${source_id}/`
          );
        } else {
          scheduleResource = await requestGet<ScheduleResources>(
            `${props.resourceEndPoint ?? ''}${id}/`
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
            resourceId: scheduleResource.id || Number(id),
          },
        }));
        setValue('resource', scheduleResource);
        setValue('resourceId', scheduleResource.id);
        setValue('schedule_type', scheduleResource.type);
      } catch (error) {
        HandleErrors(error as Error);
      }
    };

    void getResource();
  }, [
    alertToaster,
    id,
    props.resourceEndPoint,
    resourceId,
    setStepData,
    setWizardData,
    setValue,
    source_id,
    t,
  ]);

  useEffect(() => {
    async function updatePromptStep() {
      if (
        !resourceId ||
        (scheduleType !== 'job_template' && scheduleType !== 'workflow_job_template')
      ) {
        return;
      }
      const urlId = resourceId || Number(id);
      try {
        const endPoint =
          scheduleType === 'job_template'
            ? awxAPI`/job_templates/${urlId?.toString()}/`
            : awxAPI`/workflow_job_templates/${urlId.toString()}/`;
        const resource = await requestGet<ScheduleResources>(endPoint);
        const launchConfig = await requestGet<LaunchConfiguration>(`${endPoint}launch/`);
        let credentials: Credential[] = [];
        let instanceGroups: InstanceGroup[] = [];
        let scheduleLabels: Label[] = [];
        let surveySpec: Survey | undefined;
        if (schedule_id) {
          if (launchConfig.ask_credential_on_launch) {
            const response = await requestGet<AwxItemsResponse<Credential>>(
              awxAPI`/schedules/${schedule_id}/credentials/`
            );
            credentials = response.results;
          }
          if (launchConfig.ask_instance_groups_on_launch) {
            const igs = await requestGet<AwxItemsResponse<InstanceGroup>>(
              awxAPI`/schedules/${schedule_id}/instance_groups/`
            );
            instanceGroups = igs.results;
          }
          if (launchConfig.ask_labels_on_launch) {
            const labels = await requestGet<AwxItemsResponse<Label>>(
              awxAPI`/schedules/${schedule_id}/labels/`
            );
            scheduleLabels = labels.results;
          }
          if (launchConfig.survey_enabled) {
            surveySpec = await requestGet<Survey>(`${endPoint}survey_spec/`);
          }
        }
        const promptValues: PromptFormValues = await getSchedulePromptValues(
          launchConfig,
          credentials,
          instanceGroups,
          scheduleLabels,
          surveySpec
        );
        // Single setStepData call that handles all updates
        setStepData((prev) => ({
          ...prev,
          promptStep: {
            ...prev.promptStep,
            prompt: {
              ...promptValues,
            },
            resource,
            launch_config: launchConfig,
          },
          details: { ...prev.details, resourceId: urlId, resource },
        }));
        setWizardData((prev) => ({
          ...prev,
          launch_config: launchConfig,
        }));
        setValue('schedule_type', scheduleType);
        setValue('launch_config', launchConfig);
      } catch (error) {
        HandleErrors(error as Error);
      }
    }
    void updatePromptStep();
  }, [
    alertToaster,
    getSchedulePromptValues,
    id,
    props.resourceEndPoint,
    resourceId,
    scheduleType,
    schedule_id,
    setStepData,
    setValue,
    t,
    setWizardData,
  ]);
  if (isTopLevelScheduleForm) {
    return (
      <>
        <ScheduleTypeInputs />
        {resourceId || resource?.id ? <ScheduleResourceInputs /> : null}
      </>
    );
  }
  return resourceId || resource?.id ? <ScheduleResourceInputs /> : <LoadingState />;
}

export function HandleErrors(error: Error) {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const { genericErrors, fieldErrors } = awxErrorAdapter(error);
  alertToaster.addAlert({
    variant: 'danger',
    title: t('Failed to fetch the template for this schedule'),
    timeout: 5000,
    children: (
      <>
        {genericErrors?.map((err) => <div key={err.message as string}>{err.message}</div>)}
        {fieldErrors?.map((err) => <div key={err.message as string}>{err.message}</div>)}
      </>
    ),
  });
}
