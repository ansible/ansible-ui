import { useParams } from 'react-router-dom';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { useFormContext, useWatch } from 'react-hook-form';
import { ScheduleFormWizard, ScheduleResourceType, ScheduleResources } from '../types';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { requestGet } from '../../../../common/crud/Data';
import { InventorySource } from '../../../interfaces/InventorySource';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageWizardStep } from '../../../../../framework';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';

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
        | Record<'promptStep', { prompt: PromptFormValues }>
    ) => void;

    stepData: {
      details?: Partial<ScheduleFormWizard>;
      promptStep?: { prompt: PromptFormValues };
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
    if (resource || !params?.id || props.resourceEndPoint === undefined) return;
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
      reset(
        {
          ...defaultValues,
          schedule_type: scheduleResource.type,
          resource: scheduleResource,
        },
        { keepDefaultValues: false }
      );
    };

    void getResource();
  }, [params, resource, defaultValues, props.resourceEndPoint, reset, setValue]);

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
    /** Only job templates and workflow job templates need to be able to fetch
     * the launch configuration.
     */

    if (
      !resource?.id ||
      props.resourceEndPoint === undefined ||
      (!props.resourceEndPoint?.includes('job_template') &&
        !props.resourceEndPoint?.includes('workflow_job_template'))
    ) {
      return;
    }
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;

      const launchConfigResults = await requestGet<LaunchConfiguration>(
        `${props.resourceEndPoint ?? ''}/${resource.id.toString()}/launch/`
      );

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

        if (stepData.promptStep && resource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('schedule_type');
          if (!isNodeTypeDirty && resource?.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.promptStep?.prompt });
          } else {
            /**  If the node type is not dirty and the node resource is not the same as the default value,
             * and the wizard data is not the same as the default value, then reset the prompt to the default value
             * else, set the prompt data to the current data.
             */
            setValue('prompt', launchConfigValue);
          }
        }
      } else {
        setWizardData((prev) => ({ ...prev, launch_config: null }));
      }
    };

    void setLaunchToWizardData();
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
    props.resourceEndPoint,
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
