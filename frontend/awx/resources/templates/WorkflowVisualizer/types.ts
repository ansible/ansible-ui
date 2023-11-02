import { NodeModel, GraphElement, ElementModel, NodeStatus } from '@patternfly/react-topology';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';

export type GraphNode = Omit<NodeModel, 'data'> & {
  runAfterTasks?: string[];
};

export type LayoutNode = WorkflowNode & {
  runAfterTasks?: string[];
};

export interface CustomEdgeProps {
  element: GraphElement<
    ElementModel,
    {
      tag: string;
      tagStatus: NodeStatus;
      endTerminalStatus: NodeStatus;
    }
  >;
}
