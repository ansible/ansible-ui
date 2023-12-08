import {
  Edge,
  EdgeModel,
  ElementModel,
  GraphElement,
  NodeModel,
  NodeStatus,
  WithSelectionProps,
  Node,
} from '@patternfly/react-topology';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

export type GraphNode = Node<NodeModel, { id: string; resource: WorkflowNode }>;

export type GraphData = ElementModel & {
  sideBarMode: string | undefined;
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
  hoverRef: (node: Element) => (() => void) | undefined;
}

export interface CustomNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      id: string;
      resource: WorkflowNode;
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
