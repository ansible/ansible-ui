import { PageFormSelect, PageWizard, PageWizardStep } from '../../../../../../framework';
import { useTranslation } from 'react-i18next';
import { PageFormCredentialSelect } from '../../../credentials/components/PageFormCredentialSelect';
import { TemplateLaunch } from '../../TemplatePage/TemplateLaunchWizard';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { Step1 } from './Step1';
export interface NodeFields {
  node_resource_type: string;
  node_resource: WorkflowNode;
  node_status_type: string;
}
export function NodeFormInputs(props: {
  setSelectedNode: (node: WorkflowNode | undefined) => void;
  selectedNode?: WorkflowNode;
}) {
  const { setSelectedNode } = props;
  const { t } = useTranslation();

  const steps: PageWizardStep[] = [
    {
      id: 'resource',
      label: t('Run type'),
      inputs: (
        <Step1 />
        // <>
        //   <PageFormSelect<NodeFields>
        //     label={t('Resource type')}
        //     name="node-resource-type"
        //     options={[
        //       { label: t('Job Template'), value: 'job_template' },
        //       { label: t('Workflow Job Template'), value: 'workflow_job_template' },
        //       { label: t('approval'), value: 'approval' },
        //       { label: t('Project Sync'), value: 'project_sync' },
        //       { label: t('Inventory Source Sync'), value: 'inventory_sync' },
        //       { label: t('Management Job'), value: 'management_job' },
        //     ]}
        //   />
        //   <PageFormJobTemplateSelect name="job_template" isRequired />
        //   <PageFormSelect
        //     label={t('Status')}
        //     name="node_status_type"
        //     options={[
        //       {
        //         label: t('Always run'),
        //         value: 'always',
        //         description: t('Execute regardless of the parent node final state.'),
        //       },
        //       {
        //         label: t('Run on success'),
        //         value: 'success',
        //         description: t('Execute when the parent node results in a successful state.'),
        //       },
        //       {
        //         label: t('Run on failure'),
        //         value: 'failure',
        //         description: t('Execute when the parent node results in a failure state.'),
        //       },
        //     ]}
        //   />
        // </>
      ),
    },
    // {
    //   id: 'credentials',
    //   label: t('Credentials'),
    //   inputs: (
    //     <PageFormCredentialSelect<TemplateLaunch>
    //       name="credentials"
    //       label={t('Credentials')}
    //       placeholder={t('Add credentials')}
    //       labelHelpTitle={t('Credentials')}
    //       labelHelp={t(
    //         'Select credentials for accessing the nodes this job will be ran against. You can only select one credential of each type. For machine credentials (SSH), checking "Prompt on launch" without selecting credentials will require you to select a machine credential at run time. If you select credentials and check "Prompt on launch", the selected credential(s) become the defaults that can be updated at run time.'
    //       )}
    //       isMultiple
    //     />
    //   ),
    // },
  ];

  const initialValues = {
    resource: {
      node_resource_type: 'job',
      node_resource: props.selectedNode || undefined,
      node_status_type: 'always',
    },
  };
  return (
    <PageWizard<NodeFields>
      steps={steps}
      onCancel={() => setSelectedNode(undefined)}
      onSubmit={() => {
        return Promise.resolve();
      }}
      defaultValue={initialValues}
    />
  );
}
