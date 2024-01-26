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
import type { WorkflowNode, UnifiedJobType } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export type GraphNodeData = {
  resource: WorkflowNode;
  all_parents_must_converge: string;
  identifier: string;
};

export type GraphEdgeData = {
  tag: string;
  tagStatus: EdgeStatus;
};
export type GraphNode = Node<NodeModel, GraphNodeData>;

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

export interface ControllerState {
  modified: boolean;
  RBAC: {
    edit: boolean;
    start: boolean;
  };
  selectedIds: string[];
  workflowTemplate: WorkflowJobTemplate;
}

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
