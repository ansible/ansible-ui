import { useTranslation } from 'react-i18next';
import { useVisualizationController, NodeShape, NodeModel } from '@patternfly/react-topology';
import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import { NodeTypeStep } from './NodeTypeStep';
import { NodeReviewStep } from './NodeReviewStep';
import { getInitialValues, getValueBasedOnJobType, hasDaysToKeep } from './helpers';
import { NODE_DIAMETER } from '../constants';
import type { WizardFormValues } from '../types';
import { useCloseSidebar } from '../hooks';

interface NewGraphNode extends NodeModel {
  data: {
    resource: {
      always_nodes: [];
      success_nodes: [];
      failure_nodes: [];
      extra_data?: {
        days: number;
      };
      identifier?: string;
      all_parents_must_converge: boolean;
      summary_fields: {
        unified_job_template: {
          id: number;
          name: string;
          description: string;
          unified_job_type: string;
          timeout?: number;
        };
      };
    };
  };
}

export function NodeAddWizard() {
  const { t } = useTranslation();
  const closeSidebar = useCloseSidebar();
  const controller = useVisualizationController();
  const steps: PageWizardStep[] = [
    {
      id: 'nodeTypeStep',
      label: t('Node details'),
      inputs: <NodeTypeStep />,
    },
    { id: 'review', label: t('Review'), element: <NodeReviewStep /> },
  ];

  const initialValues = getInitialValues();

  const handleSubmit = async (formValues: WizardFormValues) => {
    const nodes = controller.getGraph().getNodes();
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

    const nodeName = getValueBasedOnJobType(node_type, node_resource?.name || '', approval_name);
    const nodeLabel = node_alias === '' ? nodeName : node_alias;
    const nodeToCreate: NewGraphNode = {
      id: `${nodes.length + 1}-unsavedNode`,
      type: 'node',
      label: nodeLabel,
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
      shape: NodeShape.circle,
      data: {
        resource: {
          always_nodes: [],
          success_nodes: [],
          failure_nodes: [],
          identifier: node_alias,
          all_parents_must_converge: node_convergence === 'all',
          extra_data: {
            days: node_days_to_keep,
          },
          summary_fields: {
            unified_job_template: {
              id: Number(node_resource?.id || 0),
              name: nodeName,
              description: getValueBasedOnJobType(
                node_type,
                node_resource?.description || '',
                approval_description
              ),
              unified_job_type: node_type,
              timeout: approval_timeout,
            },
          },
        },
      },
    };

    if (node_type !== UnifiedJobType.workflow_approval) {
      delete nodeToCreate.data.resource.summary_fields.unified_job_template.timeout;
    }
    if (node_resource && !hasDaysToKeep(node_resource)) {
      delete nodeToCreate.data.resource.extra_data;
    }
    if (node_alias === '') {
      delete nodeToCreate.data.resource.identifier;
    }
    const model = controller.toModel();
    model.nodes?.push(nodeToCreate);
    controller.fromModel(model, true);
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
      title={t('Add node')}
    />
  );
}
