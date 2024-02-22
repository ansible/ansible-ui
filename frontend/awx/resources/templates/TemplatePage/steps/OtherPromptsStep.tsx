import { useTranslation } from 'react-i18next';
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
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import type { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { parseStringToTagArray } from '../../JobTemplateFormHelpers';
import type { TemplateLaunch } from '../TemplateLaunchWizard';
import { ConditionalField } from './ConditionalField';

interface OtherPromptsStepProps {
  config: LaunchConfiguration;
  template: JobTemplate | WorkflowJobTemplate;
}

export function OtherPromptsStep(props: OtherPromptsStepProps) {
  const { config, template } = props;
  const { t } = useTranslation();

  return (
    <PageFormGrid isVertical singleColumn>
      <ConditionalField isHidden={!config.ask_job_type_on_launch}>
        <PageFormSelect<TemplateLaunch>
          isRequired
          id="job_type"
          label={t('Job type')}
          labelHelpTitle={t('Job type')}
          labelHelp={t('Select a job type for this job template.')}
          name="job_type"
          options={[
            { label: t('Check'), value: 'check' },
            { label: t('Run'), value: 'run' },
          ]}
          placeholderText={t('Select job type')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_scm_branch_on_launch}>
        <PageFormTextInput<TemplateLaunch>
          name="scm_branch"
          placeholder={t('Add a source control branch')}
          labelHelpTitle={t('Source control branch')}
          labelHelp={t(
            'Branch to use in job run. Project default used if blank. Only allowed if project allow_override field is set to true.'
          )}
          label={t('Source control branch')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_labels_on_launch}>
        <PageFormLabelSelect<TemplateLaunch>
          labelHelpTitle={t('Labels')}
          labelHelp={t(
            `Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.`
          )}
          name="labels"
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_forks_on_launch}>
        <PageFormTextInput<TemplateLaunch>
          id="forks"
          label={t('Forks')}
          labelHelpTitle={t('Forks')}
          labelHelp={t(
            'The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to ansible.cfg. Refer to the Ansible documentation for details about the configuration file.'
          )}
          name="forks"
          type="number"
          placeholder={t('Add number of forks')}
          min={0}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_limit_on_launch}>
        <PageFormTextInput<TemplateLaunch>
          id="limit"
          label={t('Limit')}
          labelHelpTitle={t('Limit')}
          labelHelp={t(
            'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.'
          )}
          name="limit"
          placeholder={t('Add a limit to reduce number of hosts.')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_verbosity_on_launch}>
        <PageFormSelect<TemplateLaunch>
          name="verbosity"
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
        <PageFormTextInput<TemplateLaunch>
          id="job_slice_count"
          label={t('Job slicing')}
          labelHelpTitle={t('Job slicing')}
          labelHelp={t(
            'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
          )}
          name="job_slice_count"
          type="number"
          placeholder={t('Add number of slices')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_timeout_on_launch}>
        <PageFormTextInput<TemplateLaunch>
          id="timeout"
          label={t('Timeout')}
          labelHelpTitle={t('Timeout')}
          labelHelp={t(
            'The amount of time (in seconds) to run before the task is canceled and considered failed. A value of 0 means no timeout.'
          )}
          name="timeout"
          type="number"
          placeholder={t('Add timeout')}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_diff_mode_on_launch}>
        <PageFormSwitch<TemplateLaunch>
          id="diff_mode"
          label={t('Show changes')}
          labelHelpTitle={t('Show changes')}
          labelHelp={t(
            `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
          )}
          name="diff_mode"
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_tags_on_launch}>
        <PageFormCreatableSelect<TemplateLaunch>
          labelHelpTitle={t('Job tags')}
          labelHelp={t(
            'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
          )}
          name="job_tags"
          placeholderText={t('Select or create job tags')}
          label={t('Job tags')}
          options={parseStringToTagArray(template?.job_tags) || []}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_skip_tags_on_launch}>
        <PageFormCreatableSelect<TemplateLaunch>
          labelHelpTitle={t('Job tags')}
          labelHelp={t(
            'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
          )}
          name="skip_tags"
          placeholderText={t('Select or create skip tags')}
          label={t('Skip tags')}
          options={parseStringToTagArray(template?.skip_tags) || []}
        />
      </ConditionalField>
      <ConditionalField isHidden={!config.ask_variables_on_launch}>
        <PageFormDataEditor<TemplateLaunch>
          labelHelpTitle={t('Variables')}
          labelHelp={t(`Optional extra variables to be applied to job template`)}
          format="yaml"
          label={t('Variables')}
          name="extra_vars"
        />
      </ConditionalField>
    </PageFormGrid>
  );
}
