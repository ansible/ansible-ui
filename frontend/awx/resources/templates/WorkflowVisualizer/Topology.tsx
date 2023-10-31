import { useEffect, useRef, useState } from 'react';
import {
  ComponentFactory,
  Controller,
  DEFAULT_SPACER_NODE_TYPE,
  DefaultGroup,
  DefaultNode,
  Graph,
  GraphComponent,
  Model,
  ModelKind,
  NodeShape,
  DagreLayout,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  getEdgesFromNodes,
  withPanZoom,
  DefaultEdge,
} from '@patternfly/react-topology';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { LayoutNode, GraphNode } from './types';

const baselineComponentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return DefaultNode;
        case ModelKind.edge:
          return DefaultEdge;
        default:
          return undefined;
      }
  }
};

const NODE_DIAMETER = 50;

interface TopologyProps {
  data: AwxItemsResponse<WorkflowNode>;
}
export const Topology = ({ data: { results = [] } }: TopologyProps) => {
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
      (type: string, graph: Graph) => new DagreLayout(graph, { rankdir: 'LR' })
    );

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
  }, []);

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
      };

      return node;
    });

    const edges = getEdgesFromNodes(nodes, DEFAULT_SPACER_NODE_TYPE, 'edge');

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
