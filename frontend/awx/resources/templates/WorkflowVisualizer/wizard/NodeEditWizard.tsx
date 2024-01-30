import { useTranslation } from 'react-i18next';
import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import type { GraphNode, GraphNodeData, WizardFormValues } from '../types';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { NodeTypeStep } from './NodeTypeStep';
import { NodeReviewStep } from './NodeReviewStep';
import { useCloseSidebar } from '../hooks';
import {
  getInitialValues,
  getNodeLabel,
  getValueBasedOnJobType,
  hasDaysToKeep,
  replaceIdentifier,
} from './helpers';

export function NodeEditWizard({ node }: { node: GraphNode }) {
  const { t } = useTranslation();
  const closeSidebar = useCloseSidebar();
  const initialValues = getInitialValues(node);

  const steps: PageWizardStep[] = [
    {
      id: 'nodeTypeStep',
      label: t('Node details'),
      inputs: <NodeTypeStep />,
    },
    { id: 'review', label: t('Review'), element: <NodeReviewStep /> },
  ];

  const handleSubmit = async (formValues: WizardFormValues) => {
    const nodeData = node.getData() as { resource: WorkflowNode };

    const {
      approval_name,
      approval_description,
      node_type,
      node_resource,
      approval_timeout,
      node_alias,
      node_convergence,
      node_days_to_keep,
    } = formValues;

    const resourceIdentifier = replaceIdentifier(nodeData.resource.identifier, node_alias)
      ? node_alias
      : nodeData.resource.identifier;

    const nodeUJT = {
      id: node_resource?.id || 0,
      name: getValueBasedOnJobType(node_type, node_resource?.name || '', approval_name),
      description: getValueBasedOnJobType(
        node_type,
        node_resource?.description || '',
        approval_description
      ),
      unified_job_type: node_type,
      timeout: approval_timeout,
    };

    const nodeToEdit: GraphNodeData = {
      ...nodeData,
      resource: {
        ...nodeData.resource,
        all_parents_must_converge: node_convergence === 'all',
        identifier: resourceIdentifier,
        extra_data: {
          days: node_days_to_keep,
        },
        summary_fields: {
          ...nodeData.resource.summary_fields,
          unified_job_template: nodeUJT,
        },
      },
    };

    if (node_type !== UnifiedJobType.workflow_approval) {
      delete nodeToEdit.resource.summary_fields.unified_job_template.timeout;
    }
    if (!hasDaysToKeep(node_resource)) {
      nodeToEdit.resource.extra_data = {};
    }

    node.setLabel(getNodeLabel(nodeUJT.name, node_alias));
    node.setData(nodeToEdit);
    node.setState({ modified: true });
    closeSidebar();
    await Promise.resolve();
  };

  return (
    <PageWizard<WizardFormValues>
      isVertical
      singleColumn
      steps={steps}
      onCancel={closeSidebar}
      onSubmit={handleSubmit}
      defaultValue={initialValues}
      errorAdapter={awxErrorAdapter}
      title={t('Edit node')}
    />
  );
}
