import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CREATE_CONNECTOR_DROP_TYPE,
  ComponentFactory,
  Controller,
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
  withDragNode,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import { CustomEdge, CustomNode } from './components';
import type { LayoutNode, GraphNode } from './types';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';

const CONNECTOR_SOURCE_DROP = 'connector-src-drop';
const CONNECTOR_TARGET_DROP = 'connector-target-drop';

const baselineComponentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(withSelection()(GraphComponent));
        case ModelKind.node:
          return withDndDrop(
            nodeDropTargetSpec([
              CONNECTOR_SOURCE_DROP,
              CONNECTOR_TARGET_DROP,
              CREATE_CONNECTOR_DROP_TYPE,
            ])
          )(withDragNode(nodeDragSourceSpec('node', true, true))(withSelection()(CustomNode)));
        case ModelKind.edge:
          return CustomEdge;
        default:
          return undefined;
      }
  }
};

const NODE_DIAMETER = 50;

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
  const controllerRef = useRef<Controller>();
  const controller = controllerRef.current;

  const [layout, setLayout] = useState<LayoutNode[]>([]);

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
    const newController = new Visualization();
    newController.setFitToScreenOnLayout(true);
    newController.registerComponentFactory(baselineComponentFactory);
    newController.registerLayoutFactory(
      (type: string, graph: Graph) =>
        new DagreLayout(graph, {
          rankdir: 'LR',
          ranker: 'network-simplex',
          ranksep: 100,
        })
    );
    newController.addEventListener(SELECTION_EVENT, handleSelectedNode);

    const model: Model = {
      nodes: [],
      edges: [],
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'Dagre',
      },
    };

    newController.fromModel(model, false);

    controllerRef.current = newController;
  }, [handleSelectedNode]);

  useEffect(() => {
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
        id: 'g1',
        type: 'graph',
        layout: 'Dagre',
      },
    };

    if (!controller) {
      return;
    }

    controller.fromModel(model, true);
  }, [t, layout, controller]);

  if (!controller) {
    return null;
  }
  return (
    <VisualizationProvider controller={controller}>
      <VisualizationSurface state={selectedNode} />
    </VisualizationProvider>
  );
};
