import { PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormWatch } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormWatch';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ExternalLink } from '@ansible/hub-ui/common/ExternalLink';
import {
  Grid,
  GridItem,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  TextInput,
} from '@patternfly/react-core';
import { useEffect, useRef } from 'react';
import { Controller, FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormManagementJobsSelect } from '../../../../administration/management-jobs/components/PageFormManagementJobsSelect';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxConfig } from '../../../../common/useAwxConfig';
import type { Credential } from '../../../../interfaces/Credential';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { SystemJobTemplate } from '../../../../interfaces/SystemJobTemplate';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { RESOURCE_TYPE } from '../constants';
import { AllResources, type PromptFormValues, type WizardFormValues } from '../types';
import { getAggregateCredentials } from './getAggregateCredentials';
import { getResourceURL, shouldHideOtherStep } from './helpers';

export function NodeTypeStep(props: Readonly<{ hasSourceNode?: boolean }>) {
  const { reset, getValues, setValue, formState, getFieldState, register, control } =
    useFormContext<WizardFormValues>();

  const { defaultValues } = formState;

  const { setWizardData, setStepData } = usePageWizard<WizardFormValues>();

  // Tracks the last resourceId the effect actually processed, so we can distinguish
  // "initial load of the existing node's template" (no change needed) from
  // "user switched to a different template" (credentials must be reset).
  const prevResourceIdRef = useRef<WizardFormValues['resourceId']>(undefined);

  // Register form fields
  register('node_type');
  register('resource');
  register('prompt');

  // Watch form fields
  const nodeType = useWatch<WizardFormValues, 'node_type'>({
    name: 'node_type',
    control,
    defaultValue: defaultValues?.node_type,
  });
  const resourceId = useWatch<WizardFormValues, 'resourceId'>({
    name: 'resourceId',
  });

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
  }, [nodeType, getFieldState, setValue, reset, setWizardData, setStepData, getValues]);

  useEffect(() => {
    // Compute synchronously before any async work so the value is stable for this effect run.
    // A defined prev that differs from the current resourceId means the user explicitly switched
    // to a different template — credentials must be reset. On initial mount, prev is undefined,
    // meaning we preserve whatever stepDefaults already loaded for the existing node.
    const isTemplateChange =
      prevResourceIdRef.current !== undefined && prevResourceIdRef.current !== resourceId;
    prevResourceIdRef.current = resourceId;

    // Once we finish AAP-34015 fetchResource could probably be removed.
    const fetchResource = async () => {
      const nodeResourceUrl = getResourceURL(nodeType);
      return requestGet<AllResources>(`${nodeResourceUrl}/${resourceId?.toString() ?? ''}`);
    };

    const setLaunchToWizardData = async () => {
      let launchConfigValue = {} as PromptFormValues;
      if (!resourceId || !nodeType) return;
      setValue('resourceId', resourceId);
      let launchConfigResults = {} as LaunchConfiguration;

      const nodeResource = await fetchResource();

      // Fetch template credentials for job templates
      let templateCredentials: Credential[] = [];
      if (nodeType === RESOURCE_TYPE.job) {
        launchConfigResults = await requestGet<LaunchConfiguration>(
          awxAPI`/job_templates/${resourceId.toString()}/launch/`
        );

        // Early step-data reset: clear prompt credentials as soon as the launch config is
        // known, BEFORE the credentials fetch. Because PageWizardBody re-creates the Prompts
        // form (key={activeStep.id}) from stepData when the user navigates to that step,
        // this ensures the credential picker initialises with [] even if the user navigates
        // to Prompts before the credentials fetch completes.
        if (isTemplateChange) {
          setStepData((prev) => {
            if (!prev?.nodePromptsStep) return prev;
            return {
              ...prev,
              nodePromptsStep: {
                ...prev.nodePromptsStep,
                prompt: {
                  ...(prev.nodePromptsStep.prompt as object),
                  credentials: [],
                  labels: [],
                  instance_groups: [],
                  skip_tags: [],
                  job_tags: [],
                  extra_vars: '',
                  inventory: null,
                },
              },
            };
          });
        }

        // Fetch template credentials to determine required credential types
        const templateCredentialsResponse = await requestGet<AwxItemsResponse<Credential>>(
          awxAPI`/job_templates/${resourceId.toString()}/credentials/`
        );
        templateCredentials = templateCredentialsResponse.results || [];
      } else if (nodeType === RESOURCE_TYPE.workflow_job) {
        launchConfigResults = await requestGet<LaunchConfiguration>(
          awxAPI`/workflow_job_templates/${resourceId?.toString()}/launch/`
        );
      }
      const { job_tags, skip_tags, inventory, ...defaults } = launchConfigResults?.defaults || {};

      launchConfigValue = {
        ...defaults,
        execution_environment: defaults.execution_environment,
        inventory: inventory?.id ? inventory : null,
        job_tags: parseStringToTagArray(job_tags || ''),
        skip_tags: parseStringToTagArray(skip_tags || ''),
      };

      const shouldShowPromptStep = !shouldHideOtherStep(launchConfigResults);
      const shouldShowSurveyStep = launchConfigResults.survey_enabled;

      // Always update wizard-level data so launch_config reflects the currently selected template.
      // This prevents stale prompt flags from a previously selected template being used on save.
      setWizardData((prev) => ({
        ...prev,
        launch_config: shouldShowPromptStep || shouldShowSurveyStep ? launchConfigResults : null,
        resourceId,
        resource: nodeResource,
      }));

      if (shouldShowPromptStep || shouldShowSurveyStep) {
        setStepData((prev) => {
          const prompts = prev.nodePromptsStep?.prompt;

          // When the template has not changed (initial load or same-template re-render),
          // preserve any user-entered prompt values from the existing step state so they
          // survive the effect re-run. When the template HAS changed, all prompt fields
          // must start from the new template's defaults — stale values from a different
          // template's playbook are meaningless and can cause incorrect job runs or API errors.
          const preservedPromptOverrides = isTemplateChange
            ? {}
            : {
                inventory: prompts?.inventory ?? launchConfigValue.inventory,
                execution_environment: prompts?.execution_environment
                  ? {
                      id: prompts?.execution_environment?.id ?? prompts?.execution_environment,
                      name: prompts?.execution_environment?.name ?? '',
                    }
                  : launchConfigValue?.execution_environment,
                extra_vars:
                  prompts?.extra_vars && prompts.extra_vars !== ''
                    ? prompts.extra_vars
                    : (launchConfigValue?.extra_vars ?? ''),
                skip_tags: [...(prompts?.skip_tags || []), ...(launchConfigValue?.skip_tags || [])],
                job_tags: [...(prompts?.job_tags || []), ...(launchConfigValue?.job_tags ?? [])],
                instance_groups: [
                  ...(prompts?.instance_groups ?? []),
                  ...(launchConfigValue?.instance_groups ?? []),
                ],
                labels: [...(prompts?.labels ?? []), ...(launchConfigValue?.labels ?? [])],
                diff_mode: prompts?.diff_mode ?? launchConfigValue?.diff_mode,
                forks: prompts?.forks ?? launchConfigValue?.forks,
                limit: prompts?.limit ?? launchConfigValue?.limit,
                scm_branch: prompts?.scm_branch ?? launchConfigValue?.scm_branch,
                verbosity: prompts?.verbosity ?? launchConfigValue?.verbosity,
                job_slice_count: prompts?.job_slice_count ?? launchConfigValue?.job_slice_count,
                timeout: prompts?.timeout ?? launchConfigValue?.timeout,
                job_type: prompts?.job_type ?? launchConfigValue?.job_type,
              };

          const newCredentials = getAggregateCredentials(
            [],
            isTemplateChange ? [] : (prompts?.credentials ?? []),
            launchConfigValue?.credentials ?? []
          );

          return {
            ...prev,
            nodePromptsStep: {
              launch_config: launchConfigResults,
              resourceId,
              resource: nodeResource,
              prompt: {
                ...launchConfigValue,
                ...preservedPromptOverrides,
                credentials: newCredentials,
                requiredCredentialTypes: templateCredentials.map((cred) => ({
                  id: cred.credential_type,
                  name: cred.summary_fields.credential_type.name,
                })),
              },
            },
          };
        });
      } else if (isTemplateChange) {
        // The user switched to a template that has no promptable fields. Clear the entire
        // previous prompt step state so stale values from the old template are not submitted.
        // processCredentials, processLabels, and processInstanceGroups all check for non-empty
        // arrays independently of ask_*_on_launch flags, so any leftover values would be sent.
        // On initial load (isTemplateChange=false) there is nothing stale to clear.
        setStepData((prev) => {
          if (!prev?.nodePromptsStep) return prev;
          return {
            ...prev,
            nodePromptsStep: {
              launch_config: launchConfigResults,
              resourceId,
              resource: nodeResource,
              prompt: {
                credentials: [],
                labels: [],
                instance_groups: [],
                requiredCredentialTypes: [],
              },
            },
          };
        });
      }
    };

    if (nodeType === RESOURCE_TYPE.job || nodeType === RESOURCE_TYPE.workflow_job) {
      void setLaunchToWizardData();
    }
  }, [resourceId, nodeType, setWizardData, setValue, setStepData]);

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
      data-testid="node-status-type"
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
      data-testid="node-type"
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
                name="resourceId"
                isRequired
              />
            );
          case RESOURCE_TYPE.workflow_job:
            return (
              <PageFormJobTemplateSelect<WizardFormValues>
                templateType="workflow_job_templates"
                name="resourceId"
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
            return <PageFormProjectSelect<WizardFormValues> name="resourceId" isRequired />;
          case RESOURCE_TYPE.inventory_update:
            return <PageFormInventorySourceSelect<WizardFormValues> name="resourceId" isRequired />;
          case RESOURCE_TYPE.system_job:
            return (
              <>
                <PageFormManagementJobsSelect<WizardFormValues> name="resourceId" isRequired />
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
                      data-testid="approval_timeout_minutes"
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
                      data-testid="approval_timeout_seconds"
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
      data-testid="node-convergence"
      labelHelpTitle={t('Convergence')}
      labelHelp={
        <>
          {t('Preconditions for running this node when there are multiple parents')}{' '}
          <ExternalLink href={useGetDocsUrl(config, 'workflowVisBuild')}>
            {t('documentation.')}
          </ExternalLink>
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
      data-testid="node-alias"
      labelHelpTitle={t('Node alias')}
      labelHelp={t(
        'If specified, this field will be shown on the node instead of the resource name when viewing the workflow'
      )}
      isRequired={isAliasRequired}
    />
  );
}
