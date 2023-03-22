import { Button, FormSection } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageFormSelectOption } from '../../../../framework';
import { PageFormCheckbox } from '../../../../framework/PageForm/Inputs/PageFormCheckbox';
import { PageFormCreatableSelect } from '../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormSwitch } from '../../../../framework/PageForm/Inputs/PageFormSwitch';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../common/crud/Data';
import { PageFormExecutionEnvironmentSelect } from '../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { JobTemplateForm } from '../../interfaces/JobTemplateForm';
import { Label } from '../../interfaces/Label';
import { Project } from '../../interfaces/Project';
import { PageFormCredentialSelect } from '../credentials/components/PageFormCredentialSelect';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectSelect';

function JobTemplateInputs(props: { jobtemplate?: JobTemplateForm | JobTemplate }) {
  const { jobtemplate } = props;
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const [playbookOptions, setPlaybookOptions] = useState<string[]>();
  const [labelOptions, setLabels] = useState<Label[]>();
  const project = useWatch({ name: 'project' }) as number;
  const projectName = useWatch({ name: 'summary_fields.project.name' }) as string;
  const projectPath = useWatch({
    name: 'summay_fields.project',
  }) as Project;
  const isProvisioningCallbackEnabled = useWatch({ name: 'enableHostConfig' }) as boolean;
  const isWebhookEnabled = useWatch({ name: 'isWebhookEnabled' }) as boolean;
  const hasWebhookService = useWatch({ name: 'webhook_service ' }) as boolean;
  const isInventoryPrompted = useWatch({ name: 'ask_inventory_on_launch' }) as boolean;
  const askJobTypeOnLaunch = useWatch({ name: 'ask_job_type_on_launch' }) as boolean;
  const { setValue } = useForm();

  useEffect(() => {
    async function fetchLabels() {
      const allLabels = [];
      try {
        const labels = await requestGet<ItemsResponse<Label>>(
          `/api/v2/labels/?order_by=name&page=1&page_size=200`
        );
        allLabels.push(...labels.results);
        if (labels.next !== null) {
          const nextLabels = await requestGet<ItemsResponse<Label>>(
            `/api/v2/labels/?order_by=name&page=2&page_size=200`
          );
          allLabels.push(...nextLabels.results);
        }
      } catch (err) {
        /// handle Error
      } finally {
        setLabels(allLabels);
      }
    }
    void fetchLabels();
  }, []);

  useEffect(() => {
    async function handleFetchPlaybooks() {
      if (project) {
        const playbooks = await requestGet<string[]>(`/api/v2/projects/${project}/playbooks/`);
        return setPlaybookOptions(playbooks);
      }
    }
    handleFetchPlaybooks().catch(() => 'there was an error');
  }, [project, projectName, setValue]);

  const handleFetchWebhookKey = useCallback(async () => {
    if (isWebhookEnabled && params.id) {
      const webhookKey = await requestGet<string>(
        '/api/v2/job_template/job_template_id/webhook_key'
      );
      setValue('wehbook_key', webhookKey);
      return;
    }
  }, [isWebhookEnabled, setValue, params]);

  useEffect(() => {
    handleFetchWebhookKey().catch(() => t('There was an error fetching webhook key'));
  }, [isWebhookEnabled, handleFetchWebhookKey, t]);
  return (
    <>
      <PageFormTextInput<JobTemplateForm>
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Add a name for this job template')}
      />
      <PageFormTextInput<JobTemplateForm>
        name="description"
        label={t('Description')}
        placeholder={t('Add a description for this job template')}
      />
      <PageFormSelectOption<JobTemplateForm>
        isRequired={!askJobTypeOnLaunch}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_job_type_on_launch" />
        }
        labelHelpTitle={t('Job type')}
        labelHelp={t('Select a job type for this job template.')}
        name="job_type"
        id="job_type"
        label={t('Job Type')}
        options={[
          { label: t('Check'), value: 'check' },
          { label: t('Run'), value: 'run' },
        ]}
        placeholderText={t('Select Job Type')}
      />
      <PageFormInventorySelect<JobTemplateForm>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_inventory_on_launch" />
        }
        name="summary_fields.inventory.name"
        inventoryIdPath="inventory"
        inventoryPath="summary_fields.inventory"
        isRequired={!isInventoryPrompted}
      />
      <PageFormProjectSelect<JobTemplateForm>
        name="summary_fields.project.name"
        project="project"
        projectPath="summary_fields.project"
      />

      <PageFormSelectOption<JobTemplateForm>
        name="playbook"
        labelHelpTitle={t('Playbook')}
        labelHelp={t('Select the playbook to be executed by this job.')}
        placeholderText={t('Add a project, then select a playbook')}
        label={t('Playbook')}
        isRequired
        isDisabled={!playbookOptions?.length}
        options={playbookOptions?.map((playbook) => ({ label: playbook, value: playbook })) ?? []}
      />

      {projectPath?.allow_override ? (
        <PageFormTextInput<JobTemplateForm>
          name="scm_branch"
          placeholder={t('Add a source control branch')}
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
      <PageFormExecutionEnvironmentSelect<JobTemplateForm>
        additionalControls={
          <PageFormCheckbox
            label={t('Prompt on launch')}
            name="ask_execution_environment_on_launch"
          />
        }
        name="summary_fields.execution_environment.name"
        executionEnvironmentIdPath="execution_environment"
        organizationId={jobtemplate?.organization?.toString() ?? ''}
      />
      <PageFormCredentialSelect<JobTemplateForm>
        name="summary_fields.credentials"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_credential_on_launch" />
        }
      />
      <PageFormCreatableSelect<JobTemplateForm>
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.`
        )}
        name="summary_fields.labels.results"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_labels_on_launch" />
        }
        placeholderText={t('Select or create labels')}
        label={t('Labels')}
        options={
          labelOptions?.map((label) => ({ value: label, label: label.name })) ?? [
            { label: '', value: '' },
          ]
        }
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Add number of forks')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_forks_on_launch" />
        }
        name="forks"
        labelHelpTitle={t('Forks')}
        labelHelp={t(
          'The number of parallel or simultaneous processes to use while executing the playbook. An empty value, or a value less than 1 will use the Ansible default which is usually 5. The default number of forks can be overwritten with a change to ansible.cfg. Refer to the Ansible documentation for details about the configuration file.'
        )}
        type="number"
        label={t('Forks')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Add a limit to reduce number of hosts.')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_limit_on_launch" />
        }
        name="limit"
        labelHelpTitle={t('Limit')}
        labelHelp={t(
          'Provide a host pattern to further constrain the list of hosts that will be managed or affected by the playbook. Multiple patterns are allowed. Refer to Ansible documentation for more information and examples on patterns.'
        )}
        label={t('Limit')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Select a verbosity value')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_verbosity_on_launch" />
        }
        name="verbosity"
        type="number"
        labelHelpTitle={t('Limit')}
        labelHelp={t('Control the level of output ansible will produce as the playbook executes.')}
        label={t('Verbosity')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Add a job slicing value')}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_job_slice_count_on_launch" />
        }
        labelHelpTitle={t('Job slicing')}
        labelHelp={t(
          'Divide the work done by this job template into the specified number of job slices, each running the same tasks against a portion of the inventory.'
        )}
        name="job_slice_count"
        type="number"
        label={t('Job slicing')}
      />
      <PageFormTextInput<JobTemplateForm>
        placeholder={t('Add a timeout value')}
        type="number"
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
        labelHelpTitle={t('Show changes')}
        labelHelp={t(
          `If enabled, show the changes made by Ansible tasks, where supported. This is equivalent to Ansible's --diff mode.`
        )}
        labelOff={t('Off')}
        id="show-changes"
        label={t('On')}
        name="diff_mode"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_diff_mode_on_launch" />
        }
        formLabel={t('Show Changes')}
      />
      <PageFormInstanceGroupSelect<{ instanceGroups: string; id: number }>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_instance_groups_on_launch" />
        }
        name="instanceGroups"
      />
      <PageFormCreatableSelect<JobTemplateForm>
        labelHelpTitle={t('Job tags')}
        labelHelp={t(
          'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        name="job_tags"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_tags_on_launch" />
        }
        placeholderText={t('Select or create job tags')}
        label={t('Job Tags')}
        options={
          jobtemplate?.job_tags.split(',').map((tag) => ({ value: tag, label: tag })) ?? [
            { label: '', value: '' },
          ]
        }
      />
      <PageFormCreatableSelect<JobTemplateForm>
        labelHelpTitle={t('Skip tags')}
        labelHelp={t(
          'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_skip_tags_on_launch" />
        }
        name="skip_tags"
        placeholderText={t('Select or create skip tags')}
        label={t('Skip Tags')}
        options={
          jobtemplate?.skip_tags.split(',').map((tag) => ({ value: tag, label: tag })) ?? [
            { label: '', value: '' },
          ]
        }
      />
      <PageFormCheckbox<JobTemplateForm> label={t('Privilege escalation')} name="become_enabled" />
      <PageFormCheckbox<{ enableHostConfig: boolean }>
        label={t('Provisioning callback')}
        name="enableHostConfig"
      />
      <PageFormCheckbox<{ isWebhookEnabled: boolean }>
        label={t('Enable webhook')}
        name="isWebhookEnabled"
      />
      <PageFormCheckbox<JobTemplateForm> label={t('Concurrent jobs')} name="allow_simultaneous" />
      <PageFormCheckbox<JobTemplateForm> label={t('Enable fact storage')} name="use_fact_cache" />
      <PageFormCheckbox<JobTemplateForm>
        label={t('Prevent instance group fallback')}
        name="prevent_instance_group_fallback"
      />
      {isProvisioningCallbackEnabled ? (
        <FormSection title={t('Provisioning callback details')}>
          {jobtemplate?.related.callback ? (
            <PageFormTextInput<JobTemplateForm>
              name="related.callback"
              isDisabled
              placeholder={t('Add a callback URL')}
              label={t('Provisioning callback URL')}
            />
          ) : null}
          <PageFormTextInput<JobTemplateForm>
            name="host_config_key"
            placeholder={t('Add a host config key')}
            isRequired
            label={t('Host config key')}
          />
        </FormSection>
      ) : null}
      {isWebhookEnabled ? (
        <FormSection title={t('Webhook Details')}>
          <PageFormSelectOption<JobTemplateForm>
            name="webhook_service"
            label={t('Webhook service')}
            options={[
              { label: 'GitHub', value: 'github' },
              { label: 'GitLab', value: 'gitlab' },
            ]}
            isRequired={isWebhookEnabled}
            placeholderText={t('Select a webhook service')}
          />
          <PageFormTextInput<JobTemplateForm>
            name="related.webhook_receiver"
            isDisabled={!jobtemplate?.id || !hasWebhookService}
            label={t('Webhook URL')}
          />
          <PageFormTextInput<JobTemplateForm>
            name="related.webhook_key"
            label={t('Webhook key')}
            button={
              <Button
                ouiaId="update-webhook-key-button"
                isDisabled={!jobtemplate?.id || !hasWebhookService}
                variant="tertiary"
                aria-label={t`Update webhook key`}
                onClick={() => {
                  void handleFetchWebhookKey();
                }}
              >
                <SyncAltIcon />
              </Button>
            }
          />
        </FormSection>
      ) : null}
    </>
  );
}

export default JobTemplateInputs;
