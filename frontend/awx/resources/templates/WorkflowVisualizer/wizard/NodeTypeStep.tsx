import {
  InputGroup,
  InputGroupItem,
  InputGroupText,
  TextInput,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Controller, FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSelect, PageFormTextInput, PageWizardStep } from '../../../../../../framework';
import { PageFormGroup } from '../../../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormWatch } from '../../../../../../framework/PageForm/Utils/PageFormWatch';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import { requestGet } from '../../../../../common/crud/Data';
import { useGet } from '../../../../../common/crud/useGet';
import { PageFormManagementJobsSelect } from '../../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../../../common/util/getDocsBaseUrl';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { SystemJobTemplate } from '../../../../interfaces/SystemJobTemplate';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { RESOURCE_TYPE } from '../constants';
import type { AllResources, PromptFormValues, UnifiedJobType, WizardFormValues } from '../types';
import { shouldHideOtherStep } from './helpers';

export function NodeTypeStep(props: { hasSourceNode?: boolean }) {
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<WizardFormValues>();

  const { defaultValues } = formState;

  const {
    setWizardData,
    setStepData,
    stepData,
    steps: allSteps,
  } = usePageWizard() as {
    setWizardData: Dispatch<SetStateAction<WizardFormValues>>;
    setStepData: (
      data:
        | Record<'nodeTypeStep', Partial<WizardFormValues>>
        | Record<'nodePromptsStep', { prompt: PromptFormValues }>
    ) => void;
    stepData: {
      nodeTypeStep?: Partial<WizardFormValues>;
      nodePromptsStep?: { prompt: PromptFormValues };
    };
    wizardData: Partial<WizardFormValues>;
    visibleSteps: PageWizardStep[];
    steps: PageWizardStep[];
  };

  // Register form fields
  register('node_type');
  register('resource');
  register('prompt');

  // Watch form fields
  const nodeType = useWatch<WizardFormValues>({
    name: 'node_type',
    control,
    defaultValue: defaultValues?.node_type,
  }) as UnifiedJobType;
  const nodeResource = useWatch<WizardFormValues>({
    name: 'resource',
  }) as AllResources;

  useEffect(() => {
    const { isDirty, isTouched } = getFieldState('node_type');
    const currentFormValues = getValues();
    const isApprovalType = nodeType === RESOURCE_TYPE.workflow_approval;

    setValue('node_type', nodeType, { shouldTouch: true });

    if (isTouched && !isDirty && isApprovalType) {
      reset(undefined, {
        keepDefaultValues: true,
      });
      setWizardData({ ...currentFormValues, launch_config: null });
      setStepData({ nodeTypeStep: currentFormValues });
    }
  }, [nodeType, getFieldState, setValue, reset, allSteps, setWizardData, setStepData, getValues]);

  useEffect(() => {
    setValue('resource', null);
  }, [nodeType, setValue]);

  useEffect(() => {
    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;
      let template = getValues('resource');

      if (!template && nodeResource) {
        template = nodeResource;
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
      const { job_tags, skip_tags, inventory, ...defaults } = launchConfigResults?.defaults || {};

      launchConfigValue = {
        ...defaults,
        execution_environment: defaults.execution_environment?.id,
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

        if (stepData.nodePromptsStep && nodeResource) {
          const { isDirty: isNodeTypeDirty } = getFieldState('node_type');
          if (!isNodeTypeDirty && nodeResource.id === defaultValues?.resource?.id) {
            setValue('prompt', { ...stepData.nodePromptsStep?.prompt });
          } else {
            // If the node type is not dirty and the node resource is not the same as the default value,
            // and the wizard data is not the same as the default value, then reset the prompt to the default value
            // else, set the prompt data to the current data.
            setValue('prompt', launchConfigValue);
            if ('type' in nodeResource && nodeResource.type !== templateType) {
              setValue('resource', template);
            }
          }
        }
      } else {
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
    nodeResource,
    nodeType,
    setValue,
    setWizardData,
    stepData,
  ]);

  return (
    <>
      <NodeTypeInput />
      <NodeResourceInput />
      {props.hasSourceNode && <NodeStatusType />}
      <ConvergenceInput />
      <AliasInput />
    </>
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
function NodeTypeInput() {
  const { t } = useTranslation();
  return (
    <PageFormSelect<WizardFormValues>
      isRequired
      label={t('Node type')}
      name="node_type"
      data-cy="node-type"
      options={[
        { label: t('Job Template'), value: RESOURCE_TYPE.job },
        { label: t('Workflow Job Template'), value: RESOURCE_TYPE.workflow_job },
        { label: t('Approval'), value: RESOURCE_TYPE.workflow_approval },
        { label: t('Project Sync'), value: RESOURCE_TYPE.project_update },
        { label: t('Inventory Source Sync'), value: RESOURCE_TYPE.inventory_update },
        { label: t('Management Job'), value: RESOURCE_TYPE.system_job },
      ]}
    />
  );
}

function NodeResourceInput() {
  const { t } = useTranslation();
  return (
    <PageFormWatch watch="node_type">
      {(nodeType) => {
        switch (nodeType) {
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
    <PageFormWatch watch="resource">
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
              <Grid hasGutter sm={6}>
                <GridItem>
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
                </GridItem>
                <GridItem>
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
                </GridItem>
              </Grid>
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
          <a href={getDocsBaseUrl(config, 'workflowVisBuild')}>{t('documentation.')}</a>
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
