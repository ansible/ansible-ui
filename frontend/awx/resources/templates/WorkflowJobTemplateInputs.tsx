import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormCheckbox, PageFormDataEditor, PageFormTextInput } from '../../../../framework';
import { PageFormCreatableSelect } from '../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { WorkflowJobTemplateForm } from '../../interfaces/WorkflowJobTemplate';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { WebhookSubForm } from './components/WebhookSubForm';

export function WorkflowJobTemplateInputs(props: {
  workflowJobTemplate?: WorkflowJobTemplateForm;
}) {
  const { workflowJobTemplate } = props;
  const { setValue } = useFormContext<WorkflowJobTemplateForm>();
  const isWebhookEnabled = useWatch<WorkflowJobTemplateForm>({ name: 'isWebhookEnabled' });
  useEffect(() => {
    if (!isWebhookEnabled) {
      setValue('webhook_service', undefined);
      setValue('webhook_credential', null);
    }
  }, [isWebhookEnabled, setValue]);
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<WorkflowJobTemplateForm>
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Add a name for this workflow job template')}
      />
      <PageFormTextInput<WorkflowJobTemplateForm>
        name="description"
        label={t('Description')}
        placeholder={t('Add a description for this workflow job template')}
      />
      <PageFormSelectOrganization<WorkflowJobTemplateForm> name="organization" />
      <PageFormInventorySelect<WorkflowJobTemplateForm>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_inventory_on_launch" />
        }
        name="inventory"
      />
      <PageFormTextInput<WorkflowJobTemplateForm>
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
      <PageFormTextInput<WorkflowJobTemplateForm>
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

      <PageFormLabelSelect<WorkflowJobTemplateForm>
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.`
        )}
        name="labels"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_labels_on_launch" />
        }
      />
      <PageFormCreatableSelect<WorkflowJobTemplateForm>
        labelHelpTitle={t('Job tags')}
        labelHelp={t(
          'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        name="job_tags"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_tags_on_launch" />
        }
        placeholderText={t('Select or create job tags')}
        label={t('Job tags')}
        options={workflowJobTemplate?.job_tags ?? [{ value: '', label: '' }]}
      />
      <PageFormCreatableSelect<WorkflowJobTemplateForm>
        labelHelpTitle={t('Skip tags')}
        labelHelp={t(
          'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_skip_tags_on_launch" />
        }
        name="skip_tags"
        placeholderText={t('Select or create skip tags')}
        label={t('Skip tags')}
        options={workflowJobTemplate?.skip_tags ?? [{ value: '', label: '' }]}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<WorkflowJobTemplateForm>
          additionalControls={
            <PageFormCheckbox label={t('Prompt on launch')} name="ask_variables_on_launch" />
          }
          labelHelpTitle={t('Extra variables')}
          labelHelp={t(`Optional extra variables to be applied to job template`)}
          format="yaml"
          label={t('Extra variables')}
          name="extra_vars"
        />
      </PageFormSection>
      <PageFormSection title={t('Options')}>
        <PageFormCheckbox<WorkflowJobTemplateForm>
          label={t('Enable webhook')}
          name="isWebhookEnabled"
        />
        <PageFormCheckbox<WorkflowJobTemplateForm>
          label={t('Enable concurrent jobs')}
          name="allow_simultaneous"
        />
      </PageFormSection>

      {isWebhookEnabled ? <WebhookSubForm templateType="workflow_job_templates" /> : null}
    </>
  );
}
