import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormTextArea,
  PageFormTextInput,
} from '@ansible/ansible-ui-framework';
import { PageFormCreatableSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { WorkflowJobTemplateForm } from '../../interfaces/WorkflowJobTemplate';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { WebhookSubForm } from './components/WebhookSubForm';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';

export function WorkflowJobTemplateInputs(
  props: Readonly<{
    workflowJobTemplate?: WorkflowJobTemplateForm;
  }>
) {
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
        id="name"
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Enter workflow job template name')}
      />
      <PageFormTextArea<WorkflowJobTemplateForm>
        id="description"
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<WorkflowJobTemplateForm> name="organization" />
      <PageFormInventorySelect<WorkflowJobTemplateForm>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_inventory_on_launch" />
        }
        name="inventory.id"
      />
      <PageFormTextInput<WorkflowJobTemplateForm>
        id="limit"
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
      <PageFormTextInput<WorkflowJobTemplateForm>
        id="scm-branch"
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

      <PageFormLabelSelect<WorkflowJobTemplateForm>
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this job template, such as 'dev' or 'test'. Use labels to group and filter job templates and completed jobs.`
        )}
        name="labels"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_labels_on_launch" />
        }
      />
      <PageFormCreatableSelect<WorkflowJobTemplateForm>
        id="job_tags-form-group"
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
        options={workflowJobTemplate?.job_tags ?? [{ value: '', label: '' }]}
        isMulti={true}
      />
      <PageFormCreatableSelect<WorkflowJobTemplateForm>
        id="skip_tags-form-group"
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
        options={workflowJobTemplate?.skip_tags ?? [{ value: '', label: '' }]}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<WorkflowJobTemplateForm>
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
      <PageFormCheckbox<WorkflowJobTemplateForm>
        id="isWebhookEnabled"
        label={t('Enable webhook')}
        name="isWebhookEnabled"
        labelHelp={t(
          'Select to interface with a predefined SCM system web service that is used to launch a workflow job template.'
        )}
      />
      <PageFormCheckbox<WorkflowJobTemplateForm>
        label={t('Enable concurrent jobs')}
        name="allow_simultaneous"
        labelHelp={t('Select to allow simultaneous runs of this workflow.')}
      />

      {isWebhookEnabled ? <WebhookSubForm templateType="workflow_job_templates" /> : null}
    </>
  );
}
