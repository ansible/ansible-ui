import { Dispatch, SetStateAction, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageWizardStep } from '../../../../framework';
import { usePageWizard } from '../../../../framework/PageWizard/PageWizardProvider';
import { requestGet } from '../../../common/crud/Data';
import { awxAPI } from '../api/awx-utils';
import type { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { parseStringToTagArray } from '../../resources/templates/JobTemplateFormHelpers';
import { RESOURCE_TYPE } from '../../resources/templates/WorkflowVisualizer/constants';
import type {
  AllResources,
  PromptFormValues,
  UnifiedJobType,
  WizardFormValues,
} from '../../resources/templates/WorkflowVisualizer/types';
import { shouldHideOtherStep } from './helpers';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useLocation, useParams } from 'react-router-dom';
import { InventorySource } from '../../interfaces/InventorySource';
import { Project } from '../../interfaces/Project';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { resourceEndPoints } from '../../views/schedules/hooks/scheduleHelpers';
import {
  ResourceTypeInput,
  ResourceInput,
  NodeStatusType,
  ConvergenceInput,
  AliasInput,
  ScheduleInputs,
} from './components';

export function ResourceSelectionStep(props: { hasSourceNode?: boolean }) {
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<WizardFormValues>();

  const { defaultValues } = formState;

  const params = useParams<{ id?: string }>();
  const { pathname } = useLocation();

  const { setWizardData, setStepData, stepData, setVisibleSteps, allSteps } = usePageWizard() as {
    setWizardData: Dispatch<SetStateAction<WizardFormValues>>;
    setStepData: (
      data:
        | Record<'resourceSelectionStep', Partial<WizardFormValues>>
        | Record<'nodePromptsStep', { prompt: PromptFormValues }>
    ) => void;
    stepData: {
      resourceSelectionStep?: Partial<WizardFormValues>;
      nodePromptsStep?: { prompt: PromptFormValues };
    };
    wizardData: Partial<WizardFormValues>;
    visibleSteps: PageWizardStep[];
    setVisibleSteps: (steps: PageWizardStep[]) => void;
    allSteps: PageWizardStep[];
  };

  // Register form fields
  register('resource_type');
  register('resource');
  register('prompt');

  // Watch form fields
  const resourceType = useWatch<WizardFormValues>({
    name: 'resource_type',
    control,
    defaultValue: defaultValues?.resource_type,
  }) as UnifiedJobType;
  const selectedResource = useWatch<WizardFormValues>({
    name: 'resource',
  }) as AllResources;

  useEffect(() => {
    const { isDirty, isTouched } = getFieldState('resource_type');
    const currentFormValues = getValues();
    const isApprovalType = resourceType === RESOURCE_TYPE.workflow_approval;

    setValue('resource_type', resourceType, { shouldTouch: true });

    if (isDirty) {
      setValue('resource', null);
      const steps = allSteps.filter(
        (step) => step.id !== 'nodePromptsStep' && step.id !== 'survey'
      );
      setVisibleSteps(steps);
    }

    if (isTouched && !isDirty && isApprovalType) {
      reset(undefined, {
        keepDefaultValues: true,
      });
      const steps = allSteps.filter(
        (step) => step.id !== 'nodePromptsStep' && step.id !== 'survey'
      );
      setWizardData({ ...currentFormValues, launch_config: null });
      setStepData({ resourceSelectionStep: currentFormValues });
      setVisibleSteps(steps);
    }
  }, [
    resourceType,
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
    const getResource = async () => {
      if (!selectedResource) {
        if (!params?.id) return;
        const pathnameSplit = pathname.split('/');
        const resourceType = pathnameSplit[1] === 'projects' ? 'projects' : pathnameSplit[2];
        const nodeType = resourceType.split('_template')[0];
        setValue('resource_type', nodeType as UnifiedJobType);
        const response = await requestGet<
          Project | JobTemplate | WorkflowJobTemplate | InventorySource
        >(`${resourceEndPoints[resourceType]}${params?.id}/`);
        setValue('resource', response);
      }
    };

    if (pathname.split('/').includes('schedules')) {
      void getResource();
    }
  }, [selectedResource, params?.id, pathname, setValue]);

  useEffect(() => {
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;
      let template = getValues('resource');

      if (!template && selectedResource) {
        template = selectedResource;
      }

      if (!template) return;
      let templateType;
      if ('type' in template) {
        templateType = template.type;
      } else if ('unified_job_type' in template) {
        templateType = template.unified_job_type;
      }

      let launchConfigResults = {} as LaunchConfiguration;
      if (templateType === RESOURCE_TYPE.job || templateType === 'job_template') {
        launchConfigResults = await requestGet<LaunchConfiguration>(
          awxAPI`/job_templates/${template.id.toString()}/launch/`
        );
      } else if (
        templateType === RESOURCE_TYPE.workflow_job ||
        templateType === 'workflow_job_template'
      ) {
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

        if (stepData.nodePromptsStep && selectedResource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('resource_type');
          if (!isNodeTypeDirty && selectedResource.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.nodePromptsStep?.prompt });
          } else {
            // If the node type is not dirty and the node resource is not the same as the default value,
            // and the wizard data is not the same as the default value, then reset the prompt to the default value
            // else, set the prompt data to the current data.
            setValue('prompt', launchConfigValue);
            if ('type' in selectedResource && selectedResource.type !== templateType) {
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

    if (resourceType === RESOURCE_TYPE.job || resourceType === RESOURCE_TYPE.workflow_job) {
      void setLaunchToWizardData();
    }
  }, [
    allSteps,
    defaultValues,
    getFieldState,
    getValues,
    selectedResource,
    resourceType,
    setValue,
    setVisibleSteps,
    setWizardData,
    stepData,
  ]);
  const isWorkflow = !pathname.split('/').includes('schedule');
  const isTopLevelSchedulForm = pathname.split('/')[1] === 'schedules';

  if (isTopLevelSchedulForm) {
    return (
      <>
        <PageFormSection>
          <ResourceTypeInput />
          {resourceType && <ResourceInput needsInventory />}
        </PageFormSection>
        {selectedResource && <ScheduleInputs />}
      </>
    );
  }
  if (!isWorkflow && !isTopLevelSchedulForm) {
    return <ScheduleInputs />;
  }
  return (
    <>
      <ResourceTypeInput />
      <ResourceInput />
      {props.hasSourceNode && <NodeStatusType />}
      {isWorkflow && (
        <>
          <ConvergenceInput />
          <AliasInput />
        </>
      )}
    </>
  );
}
