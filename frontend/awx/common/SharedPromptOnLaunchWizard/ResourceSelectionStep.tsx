import { InputGroup, InputGroupItem, InputGroupText, TextInput } from '@patternfly/react-core';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Controller, FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PageFormGrid,
  PageFormSelect,
  PageFormTextInput,
  PageWizardStep,
} from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormWatch } from '../../../../framework/PageForm/Utils/PageFormWatch';
import { usePageWizard } from '../../../../framework/PageWizard/PageWizardProvider';
import { requestGet } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { PageFormManagementJobsSelect } from '../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { AwxItemsResponse } from '../AwxItemsResponse';
import { awxAPI } from '../api/awx-utils';
import { useAwxConfig } from '../useAwxConfig';
import { getDocsBaseUrl } from '../util/getDocsBaseUrl';
import type { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import type { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { PageFormInventorySourceSelect } from '../../resources/inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../resources/projects/components/PageFormProjectSelect';
import { parseStringToTagArray } from '../../resources/templates/JobTemplateFormHelpers';
import { PageFormJobTemplateSelect } from '../../resources/templates/components/PageFormJobTemplateSelect';
import { RESOURCE_TYPE } from '../../resources/templates/WorkflowVisualizer/constants';
import type { AllResources, PromptFormValues, UnifiedJobType, WizardFormValues } from './types';
import { shouldHideOtherStep } from './helpers';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useLocation, useParams } from 'react-router-dom';
import { ScheduleDetails } from '../../views/schedules/SchedulePage/ScheduleDetails';

export function ResourceSelectionStep(props: { hasSourceNode?: boolean }) {
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<WizardFormValues>();

  const { defaultValues } = formState;

  const { pathname } = useLocation();

  const { setWizardData, setStepData, stepData, setVisibleSteps, allSteps } = usePageWizard() as {
    setWizardData: Dispatch<SetStateAction<WizardFormValues>>;
    setStepData: (
      data:
        | Record<'resourceTypeStep', Partial<WizardFormValues>>
        | Record<'promptedFieldsStep', { prompt: PromptFormValues }>
    ) => void;
    stepData: {
      nodeTypeStep?: Partial<WizardFormValues>;
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
      const steps = allSteps.filter((step) => step.id !== 'promptedFieldsStep');
      setVisibleSteps(steps);
    }

    if (isTouched && !isDirty && isApprovalType) {
      reset(undefined, {
        keepDefaultValues: true,
      });
      const steps = allSteps.filter((step) => step.id !== 'promptedFieldsStep');
      setWizardData({ ...currentFormValues, launch_config: null });
      setStepData({ resourceTypeStep: currentFormValues });
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
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;

      const template = getValues('resource');

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

      const shouldShowStep = !shouldHideOtherStep(launchConfigResults);
      if (shouldShowStep) {
        setWizardData((prev) => ({
          ...prev,
          launch_config: launchConfigResults,
        }));

        setVisibleSteps(allSteps);

        if (stepData.nodePromptsStep && selectedResource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('resource_type');
          if (!isNodeTypeDirty && selectedResource.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.nodePromptsStep?.prompt });
          } else {
            // If the resource type is not dirty and the resource is not the same as the default value,
            // and the wizard data is not the same as the default value, then reset the prompt to the default value
            // else, set the prompt data to the current data.
            setValue('prompt', launchConfigValue);
            if ('type' in selectedResource && selectedResource.type !== templateType) {
              setValue('resource', template);
            }
          }
        }
      } else {
        const filteredSteps = allSteps.filter((step) => step.id !== 'nodePromptsStep');
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
          {resourceType && <ResourceSelectionInput />}
        </PageFormSection>
        {selectedResource && <ScheduleDetails />}
      </>
    );
  }
  if (!isWorkflow && !isTopLevelSchedulForm) {
    return <ScheduleDetails />;
  }
  return (
    <>
      <ResourceTypeInput />
      <ResourceSelectionInput />
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

function ResourceTypeInput() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const params = useParams();
  const isWorkflow = !pathname.split('/')[1].includes('schedule');
  const options: { label: string; value: string }[] = [
    { label: t('Job Template'), value: RESOURCE_TYPE.job },
    { label: t('Workflow Job Template'), value: RESOURCE_TYPE.workflow_job },
    { label: t('Project Sync'), value: RESOURCE_TYPE.project_update },
    { label: t('Management Job'), value: RESOURCE_TYPE.system_job },
  ];
  if (isWorkflow) {
    options
      .splice(2, 0, { label: t('Approval'), value: RESOURCE_TYPE.workflow_approval })
      .splice(4, 0, {
        label: t('Inventory Source Sync'),
        value: RESOURCE_TYPE.inventory_update,
      });
  }
  return (
    <PageFormSelect<WizardFormValues>
      isRequired={isWorkflow || !params['*']?.startsWith('schedules')}
      label={t('Resource type')}
      name="resource_type"
      data-cy="resource-type"
      options={options}
    />
  );
}

function NodeStatusType() {
  const { t } = useTranslation();
  return (
    <PageFormSelect
      label={t('Status')}
      data-cy="node-status-type"
      name="node_status_type"
      isRequired
      options={[
        {
          label: t('Always run'),
          value: 'info',
          description: t('Execute regardless of the parent node final state.'),
        },
        {
          label: t('Run on success'),
          value: 'success',
          description: t('Execute when the parent node results in a successful state.'),
        },
        {
          label: t('Run on fail'),
          value: 'danger',
          description: t('Execute when the parent node results in a failure state.'),
        },
      ]}
    />
  );
}

function ResourceSelectionInput() {
  const { t } = useTranslation();
  return (
    <PageFormWatch watch="resource_type">
      {(resourceType) => {
        switch (resourceType) {
          case RESOURCE_TYPE.job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="job_templates"
                name="resource"
                isRequired
              />
            );
          case RESOURCE_TYPE.workflow_job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="workflow_job_templates"
                name="resource"
                isRequired
              />
            );
          case RESOURCE_TYPE.workflow_approval:
            return (
              <>
                <PageFormTextInput<WizardFormValues>
                  label={t('Name')}
                  name="approval_name"
                  id="approval_name"
                  isRequired
                />
                <PageFormTextInput<WizardFormValues>
                  label={t('Description')}
                  name="approval_description"
                  id="approval_description"
                />
                <TimeoutInputs />
              </>
            );
          case RESOURCE_TYPE.project_update:
            return <PageFormProjectSelect<WizardFormValues> name="resource" isRequired />;
          case RESOURCE_TYPE.inventory_update:
            return <PageFormInventorySourceSelect<WizardFormValues> name="resource" isRequired />;
          case RESOURCE_TYPE.system_job:
            return (
              <>
                <PageFormManagementJobsSelect<WizardFormValues> name="resource" isRequired />
                <SystemJobInputs />
              </>
            );
          default:
            return;
        }
      }}
    </PageFormWatch>
  );
}

function SystemJobInputs() {
  const { t } = useTranslation();
  const { data } = useGet<AwxItemsResponse<SystemJobTemplate>>(awxAPI`/system_job_templates/`);

  const showDaysToKeep = (systemJobTemplate: SystemJobTemplate) => {
    const jobType =
      systemJobTemplate?.job_type ||
      data?.results.find((result) => systemJobTemplate?.id === result?.id)?.job_type;
    return ['cleanup_jobs', 'cleanup_activitystream'].includes(jobType || '');
  };

  return (
    <PageFormWatch watch="node_resource">
      {(systemJobTemplate: SystemJobTemplate) => {
        if (!showDaysToKeep(systemJobTemplate)) return null;

        return (
          <PageFormTextInput<WizardFormValues>
            name="node_days_to_keep"
            label={t('Days of data to be retained')}
            placeholder={t('Enter number of days')}
            type="number"
            isRequired
            min={0}
          />
        );
      }}
    </PageFormWatch>
  );
}

function TimeoutInputs() {
  const { t } = useTranslation();
  const { control } = useFormContext<WizardFormValues>();

  return (
    <Controller<WizardFormValues, FieldPath<WizardFormValues>>
      name="approval_timeout"
      control={control}
      shouldUnregister
      render={({ field }) => {
        const { onChange, value } = field;

        function timeToSeconds(minutes: number, seconds: number) {
          return minutes * 60 + seconds;
        }

        function onChangeHandler({ input, unit }: { input: number; unit: 'minutes' | 'seconds' }) {
          const totalApprovalTimeout = timeToSeconds(
            unit === 'minutes' ? input : Math.floor(Number(value) / 60),
            unit === 'seconds' ? input : Math.floor(Number(value) % 60)
          );
          onChange(totalApprovalTimeout);
        }

        return (
          <PageFormGroup fieldId="approval_timeout" label={t('Timeout')}>
            <InputGroup>
              <PageFormGrid>
                <InputGroupItem isFill>
                  <TextInput
                    placeholder={t('Timeout in minutes')}
                    onChange={(_event, value: string) =>
                      onChangeHandler({ input: Number(value), unit: 'minutes' })
                    }
                    value={Math.floor(Number(value) / 60)}
                    aria-describedby="approval_timeout_minutes-form-group"
                    type="number"
                    data-cy="approval_timeout_minutes"
                    min={0}
                  />
                  <InputGroupText>{t('minutes')}</InputGroupText>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <TextInput
                    placeholder={t('Timeout in seconds')}
                    onChange={(_event, value: string) =>
                      onChangeHandler({ input: Number(value), unit: 'seconds' })
                    }
                    value={Math.floor(Number(value) % 60)}
                    aria-describedby="approval_timeout_seconds-form-group"
                    type="number"
                    data-cy="approval_timeout_seconds"
                    min={0}
                  />
                  <InputGroupText>{t('seconds')}</InputGroupText>
                </InputGroupItem>
              </PageFormGrid>
            </InputGroup>
          </PageFormGroup>
        );
      }}
    />
  );
}

function ConvergenceInput() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <PageFormSelect<WizardFormValues>
      isRequired
      label={t('Convergence')}
      name="node_convergence"
      data-cy="node-convergence"
      labelHelpTitle={t('Convergence')}
      labelHelp={
        <>
          {t('Preconditions for running this node when there are multiple parents')}{' '}
          <a
            href={`${getDocsBaseUrl(config)}/html/userguide/workflow_templates.html#converge-node`}
          >
            {t('documentation.')}
          </a>
        </>
      }
      options={[
        {
          label: t('Any'),
          value: 'any',
          description: t(
            'Ensures that at least one parent node met the expected outcome in order to run the child node.'
          ),
        },
        {
          label: t('All'),
          value: 'all',
          description: t(
            'Ensures that every parent node met the expected outcome in order to run the child node.'
          ),
        },
      ]}
    />
  );
}

function AliasInput() {
  const { t } = useTranslation();
  const {
    formState: { defaultValues },
  } = useFormContext<WizardFormValues>();
  const isAliasRequired = defaultValues?.node_alias !== '';

  return (
    <PageFormTextInput<WizardFormValues>
      label={t('Node alias')}
      name="node_alias"
      data-cy="node-alias"
      labelHelpTitle={t('Node alias')}
      labelHelp={t(
        'If specified, this field will be shown on the node instead of the resource name when viewing the workflow'
      )}
      isRequired={isAliasRequired}
    />
  );
}
