import { useTranslation } from 'react-i18next';
import { PageFormSelect } from '../../../../../../framework';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
// import { PageFormInventorySelect } from '../../../inventories/components/PageFormInventorySelect';
// import { PageFormWorkflowJobTemplateSelect } from '../../components/PageFormWorkflowJobTemplateSelect';
// import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
// import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { UnifiedJobTemplate } from '../../../../interfaces/generated-from-swagger/api';
import { PageWizardState } from '../../../../../../framework/PageWizard/types';
import { NodeFields } from './NodeFormInputs';

interface Step1Fields extends Omit<PageWizardState, 'stepData'> {
  stepData: {
    resource: Record<string, UnifiedJobTemplate | string>;
  };
}
export function Step1() {
  const wizardData = usePageWizard();
  const { stepData } = wizardData as Step1Fields;
  console.log({ wizardData, resource });
  wizardData.node_resource;
  const { t } = useTranslation();

  return (
    <>
      <PageFormSelect<NodeFields>
        label={t('Resource type')}
        name="resource.node_resource_type"
        id="resource.node_resource_type"
        isRequired
        options={[
          { label: t('Job Template'), value: 'job' },
          { label: t('Workflow Job Template'), value: 'workflow_job' },
          { label: t('approval'), value: 'workflow_approval' },
          { label: t('Project Sync'), value: 'project_update' },
          { label: t('Inventory Source Sync'), value: 'inventory_update' },
          { label: t('Management Job'), value: 'system_job' },
        ]}
      />

      {wizardData.stepData.resource.node_resource_type && (
        <PageFormJobTemplateSelect<NodeFields> name="resource.node_resource.name" />
      )}
      {/* //   workflow_job: <PageFormWorkflowJobTemplateSelect<NodeFields> name="node_resource" />,
        //   inventory_update: (
        //     <PageFormInventorySourceSelect<NodeFields> isRequired name="node_resource" />
        //   ),
        //   project_update: <PageFormProjectSelect<NodeFields> name="node_resource" />,
        // }[resource.node_resource_type]} */}

      <PageFormSelect<NodeFields>
        isRequired
        id="node_status_type"
        label={t('Status')}
        name="node_status_type"
        options={[
          {
            label: t('Always run'),
            value: 'always',
            description: t('Execute regardless of the parent node final state.'),
          },
          {
            label: t('Run on success'),
            value: 'success',
            description: t('Execute when the parent node results in a successful state.'),
          },
          {
            label: t('Run on failure'),
            value: 'failure',
            description: t('Execute when the parent node results in a failure state.'),
          },
        ]}
      />
    </>
  );
}
