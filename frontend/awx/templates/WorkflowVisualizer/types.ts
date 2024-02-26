import {
  Edge,
  EdgeModel,
  ElementModel,
  GraphElement,
  NodeModel,
  NodeStatus,
  WithSelectionProps,
} from '@patternfly/react-topology';
import type { UnifiedJobType, WorkflowNode } from '../../interfaces/WorkflowNode';

export type GraphNode = Omit<NodeModel, 'data'> & {
  runAfterTasks?: string[];
  data: {
    jobType: UnifiedJobType;
    id: string;
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
      tagStatus: EdgeStatus;
    }
  >;
}

export interface CustomEdgeInnerProps extends Omit<CustomEdgeProps, 'element'> {
  element: Edge<
    EdgeModel,
    {
      tag: string;
      tagStatus: EdgeStatus;
    }
  >;
  dragging?: boolean;
}

export interface CustomLabelProps {
  children: React.ReactNode;
  status: EdgeStatus;
  xPoint: number;
  yPoint: number;
}

export interface CustomNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      jobType: UnifiedJobType;
      id: string;
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

export enum EdgeStatus {
  danger = NodeStatus.danger,
  success = NodeStatus.success,
  info = NodeStatus.info,
}
