import { useTranslation } from 'react-i18next';
import { useVisualizationController, NodeShape, NodeModel } from '@patternfly/react-topology';
import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { NodeTypeStep } from './NodeTypeStep';
import { NodeReviewStep } from './NodeReviewStep';
import { getValueBasedOnJobType, hasDaysToKeep, shouldHideOtherStep } from './helpers';
import { useCloseSidebar, useCreateEdge, useNodeTypeStepDefaults } from '../hooks';
import { NODE_DIAMETER, START_NODE_ID, RESOURCE_TYPE } from '../constants';
import { ControllerState, EdgeStatus, PromptFormValues, type WizardFormValues } from '../types';
import { NodePromptsStep } from './NodePromptsStep';

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
    launch_data: PromptFormValues;
  };
}
export function NodeAddWizard() {
  const { t } = useTranslation();
  const closeSidebar = useCloseSidebar();
  const createEdge = useCreateEdge();
  const controller = useVisualizationController();
  const state = controller.getState<ControllerState>();
  const nodeTypeStepDefaults = useNodeTypeStepDefaults();

  const initialValues = {
    nodeTypeStep: nodeTypeStepDefaults(),
  };

  const steps: PageWizardStep[] = [
    {
      id: 'nodeTypeStep',
      label: t('Node details'),
      inputs: <NodeTypeStep hasSourceNode={Boolean(state.sourceNode)} />,
    },
    {
      id: 'nodePromptsStep',
      label: t('Prompts'),
      inputs: <NodePromptsStep />,
      hidden: (wizardData: Partial<WizardFormValues>) => {
        const { launch_config, node_resource, node_type } = wizardData;
        if (
          (node_type === RESOURCE_TYPE.workflow_job || node_type === RESOURCE_TYPE.job) &&
          node_resource &&
          launch_config
        ) {
          return shouldHideOtherStep(launch_config);
        }
        return true;
      },
    },
    { id: 'review', label: t('Review'), element: <NodeReviewStep /> },
  ];

  const handleSubmit = async (formValues: WizardFormValues) => {
    const model = controller.toModel();

    const nodes = controller
      .getGraph()
      .getNodes()
      .filter((n) => n.getId() !== START_NODE_ID);
    const {
      approval_name,
      approval_description,
      launch_config,
      node_type,
      node_resource,
      approval_timeout,
      node_alias,
      node_convergence,
      node_days_to_keep,
      node_status_type,
      prompt,
    } = formValues;
    const promptValues = prompt;

    if (promptValues) {
      if (node_resource && 'organization' in node_resource) {
        promptValues.organization = node_resource.organization ?? null;
      }
      if (launch_config) {
        promptValues.original = {
          launch_config,
        };
      }
    }

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
        launch_data: promptValues,
      },
    };
    if (!state.sourceNode) {
      const rootEdge = createEdge(START_NODE_ID, nodeToCreate.id, EdgeStatus.info);
      model.edges?.push(rootEdge);
    }

    if (state.sourceNode) {
      const status =
        node_status_type === EdgeStatus.info
          ? EdgeStatus.info
          : node_status_type === EdgeStatus.success
            ? EdgeStatus.success
            : EdgeStatus.danger;

      const newEdge = createEdge(state.sourceNode.getId(), nodeToCreate.id, status);
      state.sourceNode.setState({ modified: true });
      model.edges?.push(newEdge);
    }

    if (node_type !== RESOURCE_TYPE.workflow_approval) {
      delete nodeToCreate.data.resource.summary_fields.unified_job_template.timeout;
    }
    if (node_resource && !hasDaysToKeep(node_resource)) {
      delete nodeToCreate.data.resource.extra_data;
    }
    if (node_alias === '') {
      delete nodeToCreate.data.resource.identifier;
    }
    model.nodes?.push(nodeToCreate);
    controller.fromModel(model, true);
    controller.getNodeById(nodeToCreate.id)?.setState({ modified: true });
    controller.setState({ ...state, modified: true });
    closeSidebar();
    controller.getGraph().layout();

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
