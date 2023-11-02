import {
  ElementModel,
  GraphElement,
  NodeModel,
  NodeStatus,
  WithSelectionProps,
} from '@patternfly/react-topology';
import type { WorkflowNode, UnifiedJobType } from '../../../interfaces/WorkflowNode';

export type GraphNode = Omit<NodeModel, 'data'> & {
  runAfterTasks?: string[];
  data: {
    jobType: UnifiedJobType;
  };
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

export interface CustomNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      jobType: UnifiedJobType;
    }
  >;
}

export enum JobType {
  job = 'job',
  workflow_job = 'workflow_job',
  project_update = 'project_update',
  workflow_approval = 'workflow_approval',
  inventory_update = 'inventory_update',
  system_job = 'system_job',
}
