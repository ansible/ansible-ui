import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormTextArea,
} from '@ansible/ansible-ui-framework';
import { PageFormCheckbox } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormCreatableSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSwitch } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSwitch';
import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { FormSection } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { PageFormCredentialSelect } from '../../access/credentials/components/PageFormCredentialSelect';
import { PageFormSelectExecutionEnvironment } from '../../administration/execution-environments/components/PageFormSelectExecutionEnvironment';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { awxAPI } from '../../common/api/awx-utils';
import { JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { Project } from '../../interfaces/Project';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectSelect';
import { PageFormPlaybookSelect } from './components/PageFormPlaybookSelect';
import { WebhookSubForm } from './components/WebhookSubForm';
import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';

// This list below comes from the previous AWX code
//https//github.com / ansible / awx / blob / c760577855bf2afacc58579e743111552dae38ef / awx / ui / src / api / models / CredentialTypes.js#L10
const acceptableCredentialKinds = [
  'machine',
  'cloud',
  'net',
  'ssh',
  'vault',
  'kubernetes',
  'cryptography',
];

export function JobTemplateInputs(props: Readonly<{ jobtemplate?: JobTemplateForm }>) {
  const { jobtemplate } = props;
  const { t } = useTranslation();
  const { setValue } = useFormContext<JobTemplateForm>();
  const [allowOverride, setAllowOverride] = useState<boolean>();
  const [organization, setOrganization] = useState<number | undefined>();

  const projectId = useWatch<JobTemplateForm, 'project'>({ name: 'project' });
  const isProvisioningCallbackEnabled = useWatch<JobTemplateForm, 'isProvisioningCallbackEnabled'>({
    name: 'isProvisioningCallbackEnabled',
  });
  const isWebhookEnabled = useWatch<JobTemplateForm, 'isWebhookEnabled'>({
    name: 'isWebhookEnabled',
  });
  const isInventoryPrompted = useWatch<JobTemplateForm, 'ask_inventory_on_launch'>({
    name: 'ask_inventory_on_launch',
  });
  const askJobTypeOnLaunch = useWatch<JobTemplateForm, 'ask_job_type_on_launch'>({
    name: 'ask_job_type_on_launch',
  });

  const [searchParams] = useURLSearchParams();
  const projectIdParam = Number(searchParams.get('project_id'));
  const inventoryIdParam = Number(searchParams.get('inventory_id'));
  // set project field if projectIdParam is provided
  useEffect(() => {
    if (projectIdParam && !jobtemplate) {
      setValue('project', projectIdParam);
    }
    if (inventoryIdParam && !jobtemplate) {
      setValue('inventory', inventoryIdParam);
    }
  }, [projectIdParam, inventoryIdParam, setValue, jobtemplate]);

  useEffect(() => {
    async function handleFetchPlaybooks() {
      if (projectId) {
        const project = await requestGet<Project>(awxAPI`/projects/${projectId.toString()}`);
        setOrganization(project.organization ?? undefined);
        setAllowOverride(project.allow_override ?? false);
      }
    }
    void handleFetchPlaybooks();
  }, [projectId, setValue]);

  return (
    <>
      <PageFormTextInput<JobTemplateForm>
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Enter job template name')}
      />
      <PageFormTextArea<JobTemplateForm>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelect<JobTemplateForm>
        isRequired={!askJobTypeOnLaunch}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_job_type_on_launch" />
        }
        labelHelpTitle={t('Job type')}
        labelHelp={t('Select a job type for this job template.')}
        name="job_type"
        id="job_type"
        label={t('Job type')}
        options={[
          { label: t('Check'), value: 'check' },
          { label: t('Run'), value: 'run' },
        ]}
        placeholderText={t('Select job type')}
      />
      <PageFormInventorySelect<JobTemplateForm>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_inventory_on_launch" />
        }
        name="inventory"
        isRequired={!isInventoryPrompted}
      />
      <PageFormProjectSelect<JobTemplateForm> name="project" isRequired />
      <PageFormPlaybookSelect
        watch="project"
        name="playbook"
        id="playbook"
        label={t('Playbook')}
        labelHelpTitle={t('Playbook')}
        labelHelp={t('Select the playbook to be executed by this job.')}
        placeholderText={t('Add a project, then select a playbook')}
        noOptionsFoundMsg={(filter) => t(`No playbook was found for "${filter}"`)}
      />

      {allowOverride ? (
        <PageFormTextInput<JobTemplateForm>
          name="scm_branch"
          placeholder={t('Enter source control branch')}
          labelHelpTitle={t('Source control branch')}
          labelHelp={t(
            'Branch to use in job run. Project default used if blank. Only allowed if project allow_override field is set to true.'
          )}
          additionalControls={
            <PageFormCheckbox label={t('Prompt on launch')} name="ask_scm_branch_on_launch" />
          }
          label={t('Source control branch')}
        />
      ) : null}
      <PageFormSelectExecutionEnvironment<JobTemplateForm>
        name="execution_environment.id"
        organizationId={organization}
        additionalControls={
          <PageFormCheckbox
            label={t('Prompt on launch')}
            name="ask_execution_environment_on_launch"
          />
        }
      />
      <PageFormCredentialSelect<JobTemplateForm>
        name="credentials"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_credential_on_launch" />
        }
        label={t('Credentials')}
        placeholder={t('Select credentials')}
        labelHelp={t(
          'Select credentials to access the nodes for this job. You can select only one of each credential type. If you check Prompt on launch but do not select a machine credential (SSH), you must choose credentials at runtime. If you select a machine credential and also check Prompt on launch, the selected credentials become the default, which you can change at runtime.'
        )}
        isMultiple
        queryParams={{ credential_type__kind__in: acceptableCredentialKinds.join(',') }}
      />
      <PageFormTextInput<JobTemplateForm>
        name="opa_query_path"
        label={t('Policy enforcement')}
        labelHelpTitle={t('Policy enforcement')}
        labelHelp={
          <Trans>
            <p>The query path for the policy enforcement to evaluate prior to job execution.</p>
            <br />
            <p>
              If using OPA, the query path should be formatted as {`{`}package{'}'}/{'{'}rule{'}'}.
            </p>
          </Trans>
        }
        placeholder={t('Enter policy enforcement')}
      />
      <PageFormLabelSelect
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this job template, such as "dev" or "test". Use labels to group and filter job templates and completed jobs.`
        )}
        name="labels"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_labels_on_launch" />
        }
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Enter number of forks')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_forks_on_launch" />
        }
        name="forks"
        labelHelpTitle={t('Forks')}
        labelHelp={t(
          'The number of simultaneous processes to use while executing the playbook. An empty value or a value less than 1 will use the Ansible default, typically 5. You can change the default in the ansible.cfg file. See the Ansible documentation for configuration details.'
        )}
        type="number"
        min={0}
        label={t('Forks')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Enter limit to reduce number of hosts')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_limit_on_launch" />
        }
        name="limit"
        labelHelpTitle={t('Limit')}
        labelHelp={t(
          'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. See the Ansible documentation for details and examples of patterns.'
        )}
        label={t('Limit')}
      />
      <PageFormSelect<JobTemplateForm>
        placeholderText={t('Enter verbosity value')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_verbosity_on_launch" />
        }
        name="verbosity"
        label={t('Verbosity')}
        labelHelpTitle={t('Verbosity')}
        labelHelp={t('Control the level of output Ansible will produce as the playbook executes.')}
        options={[
          { label: t('0 (Normal)'), value: 0 },
          { label: t('1 (Verbose)'), value: 1 },
          { label: t('2 (More Verbose)'), value: 2 },
          { label: t('3 (Debug)'), value: 3 },
          { label: t('4 (Connection Debug)'), value: 4 },
          { label: t('5 (WinRM Debug)'), value: 5 },
        ]}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Enter job slicing value')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_job_slice_count_on_launch" />
        }
        labelHelpTitle={t('Job slicing')}
        labelHelp={t(
          'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
        )}
        name="job_slice_count"
        type="number"
        min={0}
        label={t('Job slicing')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Enter timeout value')}
        type="number"
        min={0}
        labelHelpTitle={t('Timeout')}
        labelHelp={t(
          'The amount of time (in seconds) to run before the job is canceled. Defaults to 0 for no job timeout.'
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_timeout_on_launch" />
        }
        name="timeout"
        label={t('Timeout')}
      />
      <PageFormSwitch<JobTemplateForm>
        id="show-changes"
        name="diff_mode"
        label={t('Show changes')}
        labelHelpTitle={t('Show changes')}
        labelHelp={t(
          `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_diff_mode_on_launch" />
        }
      />
      <PageFormInstanceGroupSelect<JobTemplateForm>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_instance_groups_on_launch" />
        }
        name="instance_groups"
        labelHelp={t(`Select the instance groups for this job template to run on.`)}
      />
      <PageFormCreatableSelect<JobTemplateForm>
        labelHelpTitle={t('Job tags')}
        labelHelp={t(
          'Tags help you run specific parts of a play or task. Use commas to separate multiple tags. See the documentation for details on using tags.'
        )}
        name="job_tags"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_tags_on_launch" />
        }
        placeholderText={t('Select or create job tags')}
        label={t('Job tags')}
        options={jobtemplate?.job_tags ?? [{ value: '', label: '', name: '' }]}
      />
      <PageFormCreatableSelect<JobTemplateForm>
        labelHelpTitle={t('Skip tags')}
        labelHelp={t(
          'Skip tags let you skip specific parts of a play or task. Use commas to separate multiple tags. See the documentation for details on using tags.'
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_skip_tags_on_launch" />
        }
        name="skip_tags"
        placeholderText={t('Select or create skip tags')}
        label={t('Skip tags')}
        options={jobtemplate?.skip_tags ?? [{ value: '', label: '', name: '' }]}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<JobTemplateForm>
          additionalControls={
            <PageFormCheckbox label={t('Prompt on launch')} name="ask_variables_on_launch" />
          }
          labelHelpTitle={t('Extra Variables')}
          labelHelp={t(`Optional extra variables to be applied to job template.`)}
          format="yaml"
          label={t('Extra variables')}
          name="extra_vars"
        />
      </PageFormSection>
      <PageFormSection isHorizontal>
        <PageFormGroup label={t('Options')}></PageFormGroup>
      </PageFormSection>
      <PageFormCheckbox<JobTemplateForm>
        label={t('Privilege escalation')}
        name="become_enabled"
        labelHelp={t('Select to enable this playbook to run as an administrator.')}
      />
      <PageFormCheckbox<JobTemplateForm>
        label={t('Provisioning callback')}
        name="isProvisioningCallbackEnabled"
        labelHelp={t(
          'Select to enable a host to call back to automation controller through the REST API and start a job from this job template.'
        )}
      />
      <PageFormCheckbox<{ isWebhookEnabled: boolean }>
        label={t('Enable webhook')}
        name="isWebhookEnabled"
        labelHelp={t(
          'Select to interface with a predefined SCM system web service that is used to launch a job template. GitHub and GitLab are the supported SCM systems.'
        )}
      />
      <PageFormCheckbox<JobTemplateForm>
        label={t('Concurrent jobs')}
        name="allow_simultaneous"
        labelHelp={t('Select to run job slices simultaneously.')}
      />
      <PageFormCheckbox<JobTemplateForm>
        label={t('Enable fact storage')}
        name="use_fact_cache"
        labelHelp={t('Select to allow gathered facts to be stored.')}
      />
      <PageFormCheckbox<JobTemplateForm>
        label={t('Prevent instance group fallback')}
        name="prevent_instance_group_fallback"
        labelHelp={t(
          'Select to allow only the instance groups listed in the Instance Groups field to run the job.'
        )}
      />
      {isProvisioningCallbackEnabled ? (
        <FormSection title={t('Provisioning callback details')}>
          {jobtemplate?.related.callback ? (
            <PageFormTextInput<JobTemplateForm>
              name="related.callback"
              isDisabled
              placeholder={t('Enter callback URL')}
              label={t('Provisioning callback URL')}
            />
          ) : null}
          <PageFormTextInput<JobTemplateForm>
            name="host_config_key"
            placeholder={t('Enter host config key')}
            isRequired={!!isProvisioningCallbackEnabled}
            label={t('Host config key')}
          />
        </FormSection>
      ) : null}
      {isWebhookEnabled ? <WebhookSubForm templateType="job_templates" /> : null}
    </>
  );
}
