import { useLocation, useParams } from 'react-router-dom';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { useFormContext, useWatch } from 'react-hook-form';
import { ScheduleFormWizard, ScheduleResourceType, ScheduleResources } from '../types';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { requestGet } from '../../../../common/crud/Data';
import { InventorySource } from '../../../interfaces/InventorySource';
import { awxAPI } from '../../../common/api/awx-utils';
import {
  PromptFormValues,
  UnifiedJobType,
} from '../../../resources/templates/WorkflowVisualizer/types';
import { Project } from '../../../interfaces/Project';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { resourceEndPoints } from '../hooks/scheduleHelpers';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageWizardStep } from '../../../../../framework';
import { shouldHideOtherStep } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { parseStringToTagArray } from '../../../resources/templates/JobTemplateFormHelpers';
import { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import { RESOURCE_TYPE } from './constants';

export function ScheduleSelectStep() {
  const { pathname } = useLocation();
  const params = useParams();
  const resource = useWatch({ name: 'resource' }) as ScheduleResources;
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<ScheduleFormWizard>();
  const { defaultValues } = formState;

  const { setWizardData, setStepData, stepData, setVisibleSteps, allSteps } = usePageWizard() as {
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
    setVisibleSteps: (steps: PageWizardStep[]) => void;
    allSteps: PageWizardStep[];
  };

  // Register form fields
  register('schedule_type');
  register('resource');
  register('prompt');
  useEffect(() => {
    const getResource = async () => {
      if (!resource) {
        if (!params?.id) return;
        const pathnameSplit = pathname.split('/');
        const resourceType = pathnameSplit[1] === 'projects' ? 'projects' : pathnameSplit[2];
        const nodeType = resourceType.split('_template')[0];
        if (resourceType === 'inventories' && params.source_id) {
          const response = await requestGet<InventorySource>(
            awxAPI`/inventory_sources/${params.source_id}/`
          );
          setValue('schedule_type', 'inventory_update');
          setValue('resource', response);
          return;
        }
        setValue('schedule_type', nodeType as UnifiedJobType);
        const response = await requestGet<Project | JobTemplate | WorkflowJobTemplate>(
          `${resourceEndPoints[resourceType]}${params?.id}/`
        );
        setValue('resource', response);
      }
    };

    if (pathname.split('/').includes('schedules')) {
      void getResource();
    }
  }, [params, resource, pathname, setValue]);

  const nodeType = useWatch<ScheduleFormWizard>({
    name: 'schedule_type',
    control,
    defaultValue: defaultValues?.schedule_type,
  }) as ScheduleResourceType;

  useEffect(() => {
    const { isDirty, isTouched } = getFieldState('schedule_type');
    const currentFormValues = getValues();

    setValue('schedule_type', nodeType, { shouldTouch: true });

    if (isDirty) {
      const steps = allSteps.filter(
        (step) => step.id !== 'nodePromptsStep' && step.id !== 'survey'
      );
      setVisibleSteps(steps);
    }

    if (isTouched && !isDirty) {
      reset(undefined, {
        keepDefaultValues: true,
      });
      const steps = allSteps.filter(
        (step) => step.id !== 'nodePromptsStep' && step.id !== 'survey'
      );
      setWizardData({ ...currentFormValues, launch_config: null });
      setStepData({ details: currentFormValues });
      setVisibleSteps(steps);
    }
  }, [
    nodeType,
    getFieldState,
    setValue,
    reset,
    allSteps,
    setWizardData,
    setStepData,
    setVisibleSteps,
    getValues,
  ]);

  useEffect(() => {
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;
      let template = getValues('resource');

      if (!template && resource) {
        template = resource;
      }

      if (!template) return;
      let templateType;
      if ('type' in template) {
        templateType = template.type;
      }

      let launchConfigResults = {} as LaunchConfiguration;
      if (templateType === 'job_template') {
        launchConfigResults = await requestGet<LaunchConfiguration>(
          awxAPI`/job_templates/${template.id.toString()}/launch/`
        );
      } else if (templateType === 'workflow_job_template') {
        launchConfigResults = await requestGet<LaunchConfiguration>(
          awxAPI`/workflow_job_templates/${template.id.toString()}/launch/`
        );
      }
      const { job_tags, skip_tags, inventory, ...defaults } = launchConfigResults.defaults;
      launchConfigValue = {
        ...defaults,
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
        if (shouldShowPromptStep && shouldShowSurveyStep) {
          setVisibleSteps(allSteps);
        } else if (shouldShowPromptStep) {
          const filteredSteps = allSteps.filter((step) => step.id !== 'survey');
          setVisibleSteps(filteredSteps);
        } else {
          const filteredSteps = allSteps.filter((step) => step.id !== 'nodePromptsStep');
          setVisibleSteps(filteredSteps);
        }

        if (stepData.nodePromptsStep && resource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('schedule_type');
          if (!isNodeTypeDirty && resource.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.nodePromptsStep?.prompt });
          } else {
            // If the node type is not dirty and the node resource is not the same as the default value,
            // and the wizard data is not the same as the default value, then reset the prompt to the default value
            // else, set the prompt data to the current data.
            setValue('prompt', launchConfigValue);
            if ('type' in resource && resource.type !== templateType) {
              setValue('resource', template);
            }
          }
        }
      } else {
        const filteredSteps = allSteps.filter(
          (step) => step.id !== 'nodePromptsStep' && step.id !== 'survey'
        );
        setVisibleSteps(filteredSteps);
        setWizardData((prev) => ({ ...prev, launch_config: null }));
      }
    };

    if (nodeType === RESOURCE_TYPE.job || nodeType === RESOURCE_TYPE.workflow_job) {
      void setLaunchToWizardData();
    }
  }, [
    allSteps,
    defaultValues,
    getFieldState,
    getValues,
    resource,
    nodeType,
    setValue,
    setVisibleSteps,
    setWizardData,
    stepData,
  ]);
  return (
    <>
      {pathname.split('/')[1] === 'schedules' && pathname.split('/')[3] !== 'edit' ? (
        <>
          <ScheduleTypeInputs />
          {resource && <ScheduleResourceInputs />}
        </>
      ) : (
        <>{pathname.split('/').includes('schedules') && <ScheduleResourceInputs />}</>
      )}
    </>
  );
}
