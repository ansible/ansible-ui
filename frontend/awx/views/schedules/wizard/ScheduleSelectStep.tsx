import { useLocation, useParams } from 'react-router-dom';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { useFormContext, useWatch } from 'react-hook-form';
import { ScheduleFormWizard, ScheduleResourceType, ScheduleResources } from '../types';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { requestGet } from '../../../../common/crud/Data';
import { InventorySource } from '../../../interfaces/InventorySource';
import { awxAPI } from '../../../common/api/awx-utils';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { resourceEndPoints } from '../hooks/scheduleHelpers';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageWizardStep } from '../../../../../framework';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

export function ScheduleSelectStep() {
  const { pathname } = useLocation();
  const urlFragments = useMemo(() => pathname.split('/'), [pathname]);
  const isTopLevelScheduleForm = pathname.split('/')[1] === 'schedules';
  const isScheduleForm = pathname.includes('schedule');
  const params = useParams();
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<ScheduleFormWizard>();
  const { defaultValues } = formState;
  const resource = useWatch({ name: 'resource' }) as ScheduleResources;
  const {
    setWizardData,
    setStepData,
    stepData,
    steps: allSteps,
  } = usePageWizard() as {
    setWizardData: Dispatch<SetStateAction<ScheduleFormWizard>>;
    setStepData: (
      data:
        | Record<'details', Partial<ScheduleFormWizard>>
        | Record<'nodePromptsStep', { prompt: PromptFormValues }>
    ) => void;
    stepData: {
      details?: Partial<ScheduleFormWizard>;
      nodePromptsStep?: { prompt: PromptFormValues };
    };
    wizardData: Partial<ScheduleFormWizard>;
    visibleSteps: PageWizardStep[];
    steps: PageWizardStep[];
  };

  // Register form fields
  register('schedule_type');
  register('resource');
  register('prompt');
  useEffect(() => {
    if (resource) return;
    const getResource = async () => {
      if (!params?.id) return;
      const isProject = pathname.includes('projects');
      const resourceType = isProject ? 'projects' : urlFragments[2];
      const scheduleType = resourceType.split('_template')[0];
      let scheduleResource: ScheduleResources;
      if (resourceType === 'inventories' && params.source_id) {
        scheduleResource = await requestGet<InventorySource>(
          awxAPI`/inventory_sources/${params.source_id}/`
        );
      } else {
        scheduleResource = await requestGet<ScheduleResources>(
          `${resourceEndPoints[resourceType]}${params?.id}/`
        );
      }
      reset(
        {
          ...defaultValues,
          schedule_type: resourceType === 'inventories' ? 'inventory_update' : scheduleType,
          resource: scheduleResource,
        },
        { keepDefaultValues: false }
      );
    };

    if (isScheduleForm && !resource) {
      void getResource();
    }
  }, [params, pathname, resource, isScheduleForm, urlFragments, defaultValues, reset, setValue]);

  const scheduleType = useWatch<ScheduleFormWizard>({
    name: 'schedule_type',
    control,
    defaultValue: defaultValues?.schedule_type,
  }) as ScheduleResourceType;

  useEffect(() => {
    const { isDirty, isTouched } = getFieldState('schedule_type');
    const currentFormValues = getValues();

    setValue('schedule_type', scheduleType, { shouldTouch: true });

    if (isTouched && !isDirty) {
      reset(undefined, {
        keepDefaultValues: true,
      });
      setWizardData({ ...currentFormValues, launch_config: null });
      setStepData({ details: currentFormValues });
    }
  }, [
    scheduleType,
    getFieldState,
    setValue,
    reset,
    allSteps,
    setWizardData,
    setStepData,
    getValues,
  ]);

  useEffect(() => {
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;
      const isTemplate = urlFragments.includes('templates');
      if (
        (!isTemplate &&
          scheduleType !== 'job-template' &&
          scheduleType !== 'workflow-job-template') ||
        !resource?.id
      )
        return;
      const configUrl =
        scheduleType === 'job-template'
          ? awxAPI`/job_templates/${resource.id?.toString()}/launch/`
          : awxAPI`/workflow_job_templates/${resource.id?.toString()}/launch/`;

      const launchConfigResults = await requestGet<LaunchConfiguration>(configUrl);

      const {
        job_tags = '',
        skip_tags = '',
        inventory,

        ...defaults
      } = launchConfigResults.defaults;

      launchConfigValue = {
        ...defaults,
        instance_groups: defaults.instance_groups || [],
        inventory: inventory?.id ? inventory : null,
        job_tags: parseStringToTagArray(job_tags || ''),
        skip_tags: parseStringToTagArray(skip_tags || ''),
      };
      const shouldShowPromptStep = !shouldHideOtherStep(launchConfigResults);
      const shouldShowSurveyStep = launchConfigResults.survey_enabled;
      if (shouldShowPromptStep || shouldShowSurveyStep) {
        setWizardData((prev) => ({
          ...prev,
          launch_config: launchConfigResults,
        }));

        if (stepData.nodePromptsStep && resource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('schedule_type');
          if (!isNodeTypeDirty && resource.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.nodePromptsStep?.prompt });
          } else {
            // If the node type is not dirty and the node resource is not the same as the default value,
            // and the wizard data is not the same as the default value, then reset the prompt to the default value
            // else, set the prompt data to the current data.
            setValue('prompt', launchConfigValue);
          }
        }
      } else {
        setWizardData((prev) => ({ ...prev, launch_config: null }));
      }
    };

    if (scheduleType === 'job-template' || scheduleType === 'workflow-job-template') {
      void setLaunchToWizardData();
    }
  }, [
    allSteps,
    defaultValues,
    getFieldState,
    getValues,
    resource,
    scheduleType,
    setValue,
    setWizardData,
    stepData,
    isTopLevelScheduleForm,
    urlFragments,
  ]);
  return (
    <>
      {isTopLevelScheduleForm ? (
        <>
          <ScheduleTypeInputs />
          {resource && <ScheduleResourceInputs />}
        </>
      ) : (
        <ScheduleResourceInputs />
      )}
    </>
  );
}
