import { useTranslation } from 'react-i18next';
import { PageFormCheckbox, PageFormDataEditor, PageFormTextInput } from '../../../../framework';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormCreatableSelect } from '../../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { WebhookSubForm } from './components/WebhookSubForm';
import { useWatch } from 'react-hook-form';
import { WorkflowJobTemplateFormType } from './WorkflowJobTemplateForm';

export function WorkflowJobTemplateInputs(props: {
  workflowJobTemplate?: WorkflowJobTemplateFormType;
}) {
  const { workflowJobTemplate } = props;
  const isWebhookEnabled = useWatch<WorkflowJobTemplateFormType>({ name: 'isWebhookEnabled' });

  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<WorkflowJobTemplateFormType>
        name="name"
        label={t('Name')}
        isRequired
        placeholder={t('Add a name for this job template')}
      />
      <PageFormTextInput<WorkflowJobTemplateFormType>
        name="description"
        label={t('Description')}
        placeholder={t('Add a description for this job template')}
      />
      <PageFormOrganizationSelect<WorkflowJobTemplateFormType> name="summary_fields.organization.name" />
      <PageFormInventorySelect<WorkflowJobTemplateFormType>
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_inventory_on_launch" />
        }
        name="summary_fields.inventory.name"
      />
      <PageFormTextInput<WorkflowJobTemplateFormType>
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
      <PageFormTextInput<WorkflowJobTemplateFormType>
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

      <PageFormLabelSelect<WorkflowJobTemplateFormType>
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this job template, such as 'dev' or 'test'. Labels can be used to group and filter job templates and completed jobs.`
        )}
        name="summary_fields.labels.results"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_labels_on_launch" />
        }
      />
      <PageFormCreatableSelect<WorkflowJobTemplateFormType>
        labelHelpTitle={t('Job tags')}
        labelHelp={t(
          'Tags are useful when you have a large playbook, and you want to run a specific part of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        name="arrayedJobTags"
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_tags_on_launch" />
        }
        placeholderText={t('Select or create job tags')}
        label={t('Job tags')}
        options={workflowJobTemplate?.arrayedJobTags ?? [{ value: '', label: '' }]}
      />
      <PageFormCreatableSelect<WorkflowJobTemplateFormType>
        labelHelpTitle={t('Skip tags')}
        labelHelp={t(
          'Skip tags are useful when you have a large playbook, and you want to skip specific parts of a play or task. Use commas to separate multiple tags. Refer to the documentation for details on the usage of tags.'
        )}
        additionalControls={
          <PageFormCheckbox label={t('Prompt on launch')} name="ask_skip_tags_on_launch" />
        }
        name="arrayedSkipTags"
        placeholderText={t('Select or create skip tags')}
        label={t('Skip tags')}
        options={workflowJobTemplate?.arrayedSkipTags ?? [{ value: '', label: '' }]}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<WorkflowJobTemplateFormType>
          additionalControls={
            <PageFormCheckbox label={t('Prompt on launch')} name="ask_variables_on_launch" />
          }
          labelHelpTitle={t('Extra Variables')}
          labelHelp={t(`Optional extra variables to be applied to job template`)}
          toggleLanguages={['yaml', 'json']}
          label={t('Extra Variables')}
          name="extra_vars"
          isExpandable
        />
      </PageFormSection>
      <PageFormSection title={t('Options')}>
        <PageFormCheckbox<WorkflowJobTemplateFormType>
          label={t('Enable webhook')}
          name="isWebhookEnabled"
        />
        <PageFormCheckbox<WorkflowJobTemplateFormType>
          label={t('Enable concurrent jobs')}
          name="allow_simultaneous"
        />
      </PageFormSection>

      {isWebhookEnabled ? <WebhookSubForm /> : null}
    </>
  );
}
