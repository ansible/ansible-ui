import { useEffect, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  PageFormDataEditor,
  PageFormGrid,
  PageFormSelect,
  PageFormSwitch,
  PageFormTextInput,
} from '../../../../../../framework';
import { PageFormCreatableSelect } from '../../../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormLabelSelect } from '../../../../common/PageFormLabelSelect';
import type { JobTemplate } from '../../../../interfaces/JobTemplate';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import { ConditionalField } from '../../TemplatePage/steps/ConditionalField';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import { PageFormInventorySelect } from '../../../inventories/components/PageFormInventorySelect';
import { PageFormCredentialSelect } from '../../../../access/credentials/components/PageFormCredentialSelect';
import { PageFormExecutionEnvironmentSelect } from '../../../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { PromptFormValues, WizardFormValues } from '../types';

export function NodePromptsStep() {
  const { t } = useTranslation();
  const { wizardData, setStepData } = usePageWizard() as {
    wizardData: WizardFormValues;
    setStepData: React.Dispatch<SetStateAction<Record<string, object>>>;
  };
  const { reset } = useFormContext<WizardFormValues>();
  const promptForm = useWatch<{ prompt: PromptFormValues }>({ name: 'prompt' });

  const { launch_config: config, resource, prompt } = wizardData;
  const template = resource as JobTemplate | WorkflowJobTemplate;
  const organizationId = template?.organization ?? null;

  useEffect(() => {
    setStepData((prev) => ({
      ...prev,
      nodePromptsStep: {
        prompt: promptForm,
      },
    }));
  }, [promptForm, setStepData]);

  useEffect(() => {
    if (!config || !config?.defaults) return;
    const { defaults } = config;

    const readOnlyLabels = defaults?.labels?.map((label) => ({
      ...label,
      isReadOnly: true,
    }));
    const defaultPromptValues = {
      credentials: prompt?.credentials ?? defaults.credentials,
      diff_mode: prompt?.diff_mode ?? defaults.diff_mode,
      execution_environment: prompt?.execution_environment ?? defaults.execution_environment,
      extra_vars: prompt?.extra_vars ?? defaults.extra_vars,
      forks: prompt?.forks ?? defaults.forks,
      instance_groups: prompt?.instance_groups ?? defaults.instance_groups,
      inventory: prompt?.inventory ?? (defaults.inventory.id ? defaults.inventory : null),
      job_slice_count: prompt?.job_slice_count ?? defaults.job_slice_count,
      job_tags: prompt?.job_tags ?? parseStringToTagArray(defaults.job_tags),
      job_type: prompt?.job_type ?? defaults.job_type,
      labels: prompt?.labels ?? readOnlyLabels,
      limit: prompt?.limit ?? defaults.limit,
      organization: prompt?.organization ?? organizationId,
      scm_branch: prompt?.scm_branch ?? defaults.scm_branch,
      skip_tags: prompt?.skip_tags ?? parseStringToTagArray(defaults.skip_tags),
      timeout: prompt?.timeout ?? defaults.timeout,
      verbosity: prompt?.verbosity ?? defaults.verbosity,
      defaults,
    };

    setStepData((prev) => ({
      ...prev,
      nodePromptsStep: {
        prompt: defaultPromptValues,
      },
    }));
    reset({ prompt: defaultPromptValues });
  }, [reset, organizationId, setStepData, config, prompt]);

  if (!config || !template) {
    return null;
  }

  return (
    <PageFormGrid isVertical singleColumn>
      <ConditionalField isHidden={!config.ask_inventory_on_launch}>
        <PageFormInventorySelect<WizardFormValues> name="prompt.inventory" isRequired />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_credential_on_launch}>
        <PageFormCredentialSelect<WizardFormValues>
          name="prompt.credentials"
          label={t('Credentials')}
          placeholder={t('Add credentials')}
          labelHelpTitle={t('Credentials')}
          labelHelp={t(
            'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
          )}
          isMultiple
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_execution_environment_on_launch}>
        <PageFormExecutionEnvironmentSelect<WizardFormValues>
          name="prompt.execution_environment.name"
          executionEnvironmentPath="prompt.execution_environment"
          executionEnvironmentIdPath="prompt.execution_environment.id"
          organizationId={organizationId?.toString() ?? ''}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_instance_groups_on_launch}>
        <PageFormInstanceGroupSelect<WizardFormValues>
          name="prompt.instance_groups"
          labelHelp={t(`Select the instance groups for this template to run on.`)}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_job_type_on_launch}>
        <PageFormSelect<WizardFormValues>
          isRequired
          id="job_type"
          label={t('Job type')}
          labelHelpTitle={t('Job type')}
          labelHelp={t('Select a job type for this job template.')}
          name="prompt.job_type"
          options={[
            { label: t('Check'), value: 'check' },
            { label: t('Run'), value: 'run' },
          ]}
          placeholderText={t('Select job type')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_scm_branch_on_launch}>
        <PageFormTextInput<WizardFormValues>
          name="prompt.scm_branch"
          placeholder={t('Add a source control branch')}
          labelHelpTitle={t('Source control branch')}
          labelHelp={t(
            'Branch to use in job run. Project default used if blank. Only allowed if project allow_override field is set to true.'
          )}
          label={t('Source control branch')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_labels_on_launch}>
        <PageFormLabelSelect<WizardFormValues>
          labelHelpTitle={t('Labels')}
          labelHelp={t(
            `Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.`
          )}
          name="prompt.labels"
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_forks_on_launch}>
        <PageFormTextInput<WizardFormValues>
          id="forks"
          label={t('Forks')}
          labelHelpTitle={t('Forks')}
          labelHelp={t(
            'The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to ansible.cfg. Refer to the Ansible documentation for details about the configuration file.'
          )}
          name="prompt.forks"
          type="number"
          placeholder={t('Add number of forks')}
          min={0}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_limit_on_launch}>
        <PageFormTextInput<WizardFormValues>
          id="limit"
          label={t('Limit')}
          labelHelpTitle={t('Limit')}
          labelHelp={t(
            'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.'
          )}
          name="prompt.limit"
          placeholder={t('Add a limit to reduce number of hosts.')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_verbosity_on_launch}>
        <PageFormSelect<WizardFormValues>
          name="prompt.verbosity"
          label={t('Verbosity')}
          labelHelpTitle={t('Verbosity')}
          labelHelp={t(
            'Control the level of output ansible will produce as the playbook executes.'
          )}
          options={[
            { label: t`0 (Normal)`, value: 0 },
            { label: t`1 (Verbose)`, value: 1 },
            { label: t`2 (More Verbose)`, value: 2 },
            { label: t`3 (Debug)`, value: 3 },
            { label: t`4 (Connection Debug)`, value: 4 },
            { label: t`5 (WinRM Debug)`, value: 5 },
          ]}
          placeholderText={t('Select a verbosity value')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_job_slice_count_on_launch}>
        <PageFormTextInput<WizardFormValues>
          id="job_slice_count"
          label={t('Job slicing')}
          labelHelpTitle={t('Job slicing')}
          labelHelp={t(
            'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
          )}
          name="prompt.job_slice_count"
          type="number"
          placeholder={t('Add number of slices')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_timeout_on_launch}>
        <PageFormTextInput<WizardFormValues>
          id="timeout"
          label={t('Timeout')}
          labelHelpTitle={t('Timeout')}
          labelHelp={t(
            'The amount of time (in seconds) to run before the task is canceled and considered failed. A value of 0 means no timeout.'
          )}
          name="prompt.timeout"
          type="number"
          placeholder={t('Add timeout')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_diff_mode_on_launch}>
        <PageFormSwitch<WizardFormValues>
          id="diff_mode"
          label={t('Show changes')}
          labelHelpTitle={t('Show changes')}
          labelHelp={t(
            `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
          )}
          name="prompt.diff_mode"
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_tags_on_launch}>
        <PageFormCreatableSelect<WizardFormValues>
          labelHelpTitle={t('Job tags')}
          labelHelp={t(
            'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
          )}
          name="prompt.job_tags"
          placeholderText={t('Select or create job tags')}
          label={t('Job tags')}
          options={parseStringToTagArray(template?.job_tags) || []}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_skip_tags_on_launch}>
        <PageFormCreatableSelect<WizardFormValues>
          labelHelpTitle={t('Job tags')}
          labelHelp={t(
            'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
          )}
          name="prompt.skip_tags"
          placeholderText={t('Select or create skip tags')}
          label={t('Skip tags')}
          options={parseStringToTagArray(template?.skip_tags) || []}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_variables_on_launch}>
        <PageFormDataEditor<WizardFormValues>
          labelHelpTitle={t('Variables')}
          labelHelp={t(`Optional extra variables to be applied to job template`)}
          label={t('Variables')}
          name="prompt.extra_vars"
          format="yaml"
        />
      </ConditionalField>
    </PageFormGrid>
  );
}
