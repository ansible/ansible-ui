import * as React from 'react';
import {
  ComponentFactory,
  Controller,
  DEFAULT_EDGE_TYPE,
  DEFAULT_FINALLY_NODE_TYPE,
  DEFAULT_SPACER_NODE_TYPE,
  DEFAULT_TASK_NODE_TYPE,
  DefaultNode,
  Graph,
  GraphComponent,
  Layout,
  Model,
  ModelKind,
  Node,
  NodeShape,
  PipelineDagreLayout,
  PipelineNodeModel,
  FinallyNode,
  SpacerNode,
  DefaultTaskGroup,
  TaskEdge,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
  getEdgesFromNodes,
  getSpacerNodes,
  graphDropTargetSpec,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withDndDrop,
  withDragNode,
  withPanZoom,
} from '@patternfly/react-topology';
import { ClipboardCheckIcon } from '@patternfly/react-icons';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';

const NODE_DIAMETER = 75;
type CustomNodeProps = {
  element: Node;
} & WithDragNodeProps;
const CustomNode: React.FunctionComponent<
  CustomNodeProps & WithSelectionProps & WithDragNodeProps & WithDndDropProps
> = ({ element }) => {
  return (
    <DefaultNode element={element}>
      <g transform={`translate(25, 25)`}>
        <ClipboardCheckIcon style={{ fill: '#000' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
};

const CONNECTOR_TARGET_DROP = 'connector-target-drop';
const pipelineComponentFactory = (kind: ModelKind, type: string) => {
  if (kind === ModelKind.graph) {
    return withDndDrop(graphDropTargetSpec())(withPanZoom()(GraphComponent));
  }
  switch (type) {
    case DEFAULT_TASK_NODE_TYPE:
      return withDndDrop(nodeDropTargetSpec([CONNECTOR_TARGET_DROP]))(
        withDragNode(nodeDragSourceSpec('node', true, true))(CustomNode)
      );
    case DEFAULT_FINALLY_NODE_TYPE:
      return FinallyNode;
    case 'task-group':
      return DefaultTaskGroup;
    case 'finally-group':
      return DefaultTaskGroup;
    case DEFAULT_SPACER_NODE_TYPE:
      return SpacerNode;
    case 'finally-spacer-edge':
    case DEFAULT_EDGE_TYPE:
      return TaskEdge;
    default:
      return undefined;
  }
};

type PipelineWorkflowNode = WorkflowNode & {
  runAfterTasks?: string[];
};

type TopologyPipelineProps = {
  data: AwxItemsResponse<WorkflowNode>;
};
export const TopologyPipeline = ({ data: { results = [] } }: TopologyPipelineProps) => {
  const controllerRef = React.useRef<Controller>();
  const controller = controllerRef.current;

  const [layout, setLayout] = React.useState<PipelineWorkflowNode[]>([]);

  React.useEffect(() => {
    const layoutNodes = results.map((node) => {
      return {
        ...node,
        runAfterTasks: [],
      };
    });

    return setLayout(() => [...layoutNodes]);
  }, [results]);

  React.useEffect(() => {
    const newController = new Visualization();
    newController.setFitToScreenOnLayout(true);
    newController.registerComponentFactory(pipelineComponentFactory as ComponentFactory);
    newController.registerLayoutFactory(
      (type: string, graph: Graph): Layout | undefined => new PipelineDagreLayout(graph)
    );

    const model: Model = {
      nodes: [],
      edges: [],
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'pipelineLayout',
      },
    };
    newController.fromModel(model, false);

    controllerRef.current = newController;
  }, []);

  React.useEffect(() => {
    const taskNodes: PipelineNodeModel[] = layout.map((n) => {
      const processNodes = (nodesArray: number[]) => {
        nodesArray.forEach((id) => {
          const afterNode = layout.find((afterNode) => afterNode.id.toString() === id.toString());
          if (afterNode) {
            if (afterNode.runAfterTasks) {
              afterNode.runAfterTasks.push(n.id.toString());
            } else {
              afterNode.runAfterTasks = [n.id.toString()];
            }
          }
        });
      };
      if (n.success_nodes.length > 0) {
        processNodes(n.success_nodes);
      }
      if (n.failure_nodes.length > 0) {
        processNodes(n.failure_nodes);
      }
      if (n.always_nodes.length > 0) {
        processNodes(n.always_nodes);
      }

      const node: PipelineNodeModel = {
        id: n.id.toString(),
        type: DEFAULT_TASK_NODE_TYPE,
        label: n.summary_fields?.unified_job_template?.name || 'UNDEFINED',
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.ellipse,
        runAfterTasks: n.runAfterTasks,
      };

      return node;
    });

    const spacerNodes = getSpacerNodes(taskNodes);
    const nodes = [...taskNodes, ...spacerNodes];
    const edges = getEdgesFromNodes(nodes);

    const model: Model = {
      edges,
      nodes,
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'pipelineLayout',
      },
    };

    if (!controller) {
      return;
    }

    controller.fromModel(model, true);
  }, [layout, controller]);

  if (!controller) {
    return null;
  }
  return (
    <VisualizationProvider controller={controller}>
      <VisualizationSurface />
    </VisualizationProvider>
  );
};
