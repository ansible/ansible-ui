import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CREATE_CONNECTOR_DROP_TYPE,
  ComponentFactory,
  DagreLayout,
  DefaultGroup,
  Graph,
  GraphComponent,
  Model,
  ModelKind,
  NodeShape,
  NodeStatus,
  SELECTION_EVENT,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withDndDrop,
  withContextMenu,
  withDragNode,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import { CustomEdge, CustomNode, NodeContextMenu } from './components';
import type { LayoutNode, GraphNode } from './types';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';

const GRAPH_ID = 'workflow-visualizer-graph';
const CONNECTOR_SOURCE_DROP = 'connector-src-drop';
const CONNECTOR_TARGET_DROP = 'connector-target-drop';
const NODE_DIAMETER = 50;

const graphModel: Model = {
  nodes: [],
  edges: [],
  graph: {
    id: GRAPH_ID,
    type: 'graph',
    layout: 'Dagre',
  },
};

interface TopologyProps {
  data: AwxItemsResponse<WorkflowNode>;
  selectedNode: WorkflowNode | undefined;
  handleSelectedNode: (clickedNodeIdentifier: string[]) => void;
}

export const Topology = ({
  data: { results = [] },
  selectedNode,
  handleSelectedNode,
}: TopologyProps) => {
  const { t } = useTranslation();
  const [layout, setLayout] = useState<LayoutNode[]>([]);
  const visualizationRef = useRef<Visualization>();
  const visualization = visualizationRef.current;

  const nodeContextMenu = NodeContextMenu();
  const baselineComponentFactory: ComponentFactory = useCallback(
    (kind: ModelKind, type: string) => {
      switch (type) {
        case 'group':
          return DefaultGroup;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(withSelection()(GraphComponent));
            case ModelKind.node:
              return withContextMenu(() => nodeContextMenu)(
                withDndDrop(
                  nodeDropTargetSpec([
                    CONNECTOR_SOURCE_DROP,
                    CONNECTOR_TARGET_DROP,
                    CREATE_CONNECTOR_DROP_TYPE,
                  ])
                )(withDragNode(nodeDragSourceSpec('node', true, true))(withSelection()(CustomNode)))
              );
            case ModelKind.edge:
              return CustomEdge;
            default:
              return undefined;
          }
      }
    },
    [nodeContextMenu]
  );

  const createVisualization = useCallback(() => {
    const newVisualization = new Visualization();
    newVisualization.setFitToScreenOnLayout(true);
    newVisualization.registerComponentFactory(baselineComponentFactory);
    newVisualization.registerLayoutFactory(
      (type: string, graph: Graph) =>
        new DagreLayout(graph, {
          edgesep: 100,
          marginx: 20,
          marginy: 20,
          rankdir: 'LR',
          ranker: 'longest-path',
          ranksep: 200,
        })
    );
    newVisualization.fromModel(graphModel, false);
    newVisualization.addEventListener(SELECTION_EVENT, handleSelectedNode);
    return newVisualization;
  }, [baselineComponentFactory, handleSelectedNode]);

  useEffect(() => {
    const layoutNodes = results.map((node) => {
      return {
        ...node,
        runAfterTasks: [],
      };
    });

    return setLayout(() => [...layoutNodes]);
  }, [results]);

  useEffect(() => {
    if (!visualizationRef.current) {
      visualizationRef.current = createVisualization();
    }
  }, [createVisualization, visualization]);

  useEffect(() => {
    if (!visualization) {
      return;
    }

    const nodes: GraphNode[] = layout.map((n) => {
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

      const node: GraphNode = {
        id: n.id.toString(),
        type: 'node',
        label: n.summary_fields?.unified_job_template?.name || 'UNDEFINED',
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.ellipse,
        runAfterTasks: n.runAfterTasks,
        data: {
          jobType: n.summary_fields?.unified_job_template?.unified_job_type,
        },
      };

      return node;
    });

    const edges = nodes.flatMap((targetNode) => {
      if (!targetNode.runAfterTasks) return [];

      return targetNode.runAfterTasks.map((sourceNodeId) => {
        const tagLabel = {
          [NodeStatus.success]: t('On success'),
          [NodeStatus.danger]: t('On fail'),
          [NodeStatus.info]: t('On always'),
        };

        const sourceNode = layout.find((node) => node.id === Number(sourceNodeId));
        const targetNodeId = targetNode.id;

        let status = NodeStatus.info;
        if (sourceNode) {
          if (sourceNode.success_nodes?.includes(Number(targetNodeId))) {
            status = NodeStatus.success;
          } else if (sourceNode.failure_nodes?.includes(Number(targetNodeId))) {
            status = NodeStatus.danger;
          }
        }

        return {
          id: `${sourceNodeId}-${targetNodeId}`,
          type: 'edge',
          source: sourceNodeId,
          target: targetNodeId,
          data: {
            tag: tagLabel[status],
            tagStatus: status,
            endTerminalStatus: status,
          },
        };
      });
    });

    const model: Model = {
      edges,
      nodes,
      graph: {
        id: GRAPH_ID,
        type: 'graph',
        layout: 'Dagre',
      },
    };

    visualization.fromModel(model, true);
  }, [t, layout, visualization]);

  if (!visualization) {
    return null;
  }

  return (
    <VisualizationProvider controller={visualization}>
      <VisualizationSurface state={selectedNode} />
    </VisualizationProvider>
  );
};
