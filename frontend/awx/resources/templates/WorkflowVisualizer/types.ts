import { NodeModel } from '@patternfly/react-topology';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';

export type GraphNode = Omit<NodeModel, 'data'> & {
  runAfterTasks?: string[];
};

export type LayoutNode = WorkflowNode & {
  runAfterTasks?: string[];
};
