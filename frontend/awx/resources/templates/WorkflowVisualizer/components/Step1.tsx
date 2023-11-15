import { useTranslation } from 'react-i18next';
import { PageFormSelect } from '../../../../../../framework';
import { PageFormJobTemplateSelect } from '../../components/PageFormJobTemplateSelect';
import { usePageWizard } from '../../../../../../framework/PageWizard/PageWizardProvider';
import { PageFormInventorySelect } from '../../../inventories/components/PageFormInventorySelect';
import { PageFormWorkflowJobTemplateSelect } from '../../components/PageFormWorkflowJobTemplateSelect';
import { PageFormInventorySourceSelect } from '../../../inventories/components/PageFormInventorySourceSelect';
import { PageFormProjectSelect } from '../../../projects/components/PageFormProjectSelect';
import { UnifiedJobTemplate } from '../../../../interfaces/generated-from-swagger/api';
import { PageWizardState } from '../../../../../../framework/PageWizard/types';

interface Step1Fields extends Omit<PageWizardState, 'stepData'> {
  stepData: {
    resource: {
      node_resource: UnifiedJobTemplate;
      node_resource_type: string;
      node_status_type: string;
    };
  };
}

export function Step1() {
  const {
    stepData: {
      resource: { node_resouce, node_resource_type, node_status_type },
    },
    ...rest
  }: Step1Fields = usePageWizard();
  const { t } = useTranslation();
  console.log({ stepData });
  const resourceType = node_resource_type;
  return (
    <>
      <PageFormSelect
        label={t('Resource type')}
        name="node_resource_type"
        id="node_resource_type"
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

      {
        {
          job: <PageFormJobTemplateSelect name="node_resource" />,
          workflow_job: <PageFormWorkflowJobTemplateSelect name="node_resource" />,
          inventory_update: <PageFormInventorySourceSelect isRequired name="node_resource" />,
          project_update: <PageFormProjectSelect name="node_resource" />,
          // workflow_approval: <PageFormWorkflowApprovalSelect name="node_resource" />,
          // system_job: <PageFormSystemJobTemplateSelec name="node_resource" />,
        }[resourceType]
      }

      <PageFormSelect
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
