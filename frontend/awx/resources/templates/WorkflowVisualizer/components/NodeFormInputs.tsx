import { PageWizard, PageWizardStep } from '../../../../../../framework';
import { useTranslation } from 'react-i18next';
import { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { NodeTypeStep } from './NodeTypeStep';
import { awxErrorAdapter } from '../../../../common/adapters/awxErrorAdapter';
import { NodeShape, isNode, useVisualizationController } from '@patternfly/react-topology';
import { useViewOptions } from '../ViewOptionsProvider';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';

export interface NodeFields {
  parentNodes?: WorkflowNode[];
  node_type:
    | 'job'
    | 'workflow_job'
    | 'workflow_approval'
    | 'project_update'
    | 'inventory_update'
    | 'system_job';
  node_resource: {
    id: number;
    name: string;
    description: string;
    unified_job_type: UnifiedJobType;
    timeout_minute: number;
    timeout_seconds: number;
  };
  node_status_type: string;
  all_parents_must_converge: string;
  identifier: string;
}

export function NodeFormInputs(props: {
  setSelectedNode: (node: WorkflowNode | undefined) => void;
  node: WorkflowNode | undefined;
}) {
  const { setSelectedNode } = props;
  const { setSidebarMode } = useViewOptions();
  const { t } = useTranslation();

  const controller = useVisualizationController();

  const steps: PageWizardStep[] = [
    {
      id: 'node_type_step',
      label: t('Run type'),
      inputs: <NodeTypeStep />,
    },
    { id: 'review', label: t('Review'), element: <h1>{t('Review')}</h1> },
  ];

  const initialValues = {
    node_type_step: {
      parentNodes: [],
      node_type: props.node?.summary_fields?.unified_job_template?.unified_job_type || 'job',
      node_resource: props.node?.summary_fields?.unified_job_template || undefined,
      node_status_type: 'always',
      all_parents_must_converge: 'any',
      idenfifier: '',
    },
  };

  const handleSubmit = async (data: NodeFields) => {
    const state = controller.getState<{
      WorkflowJobTemplate: WorkflowJobTemplate;
      unsavedNodeId: number;
    }>();
    const model = controller.toModel();

    const nodeId = state?.unsavedNodeId === undefined ? 1 : state.unsavedNodeId;
    const nodes = controller.getElements().filter(isNode);

    const node = {
      id: `${nodes.length + 1}-unsavedNode`,
      type: 'node',
      label: data.identifier || data.node_resource.name,
      width: 50,
      height: 50,
      shape: NodeShape.circle,
      data: {
        resource: {
          summary_fields: {
            unified_job_template: {
              unified_job_type: data.node_type,
              name: data.node_resource.name,
              description: data.node_resource.description,
              id: data.node_resource.id,
            },
          },
        },
        all_parents_must_converge: data.all_parents_must_converge,
        identifier: data.identifier,
      },
    };
    model?.nodes?.push(node);
    model.graph = {
      id: 'workflow-visualizer-graph',
      layout: 'Dagre',
      type: 'graph',
      visible: true,
    };

    controller.fromModel(model, false);
    controller.setState({ ...state, unsavedNodeId: nodeId + 1 });

    setSidebarMode(undefined);
    controller.getNodeById(node.id)?.setState({ modified: true });

    return Promise.resolve();
  };

  return (
    <PageWizard<NodeFields>
      isVertical
      singleColumn
      steps={steps}
      onCancel={() => setSelectedNode(undefined)}
      onSubmit={handleSubmit}
      defaultValue={initialValues}
      errorAdapter={awxErrorAdapter}
    />
  );
}
