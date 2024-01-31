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

export type GraphNode = Node<NodeModel, GraphNodeData>;
export type GraphNodeData = {
  resource: WorkflowNode;
};
export interface CustomNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      resource: WorkflowNode;
    }
  >;
}

export type GraphEdgeData = {
  tag: string;
  tagStatus: EdgeStatus;
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

export interface NodeResource {
  id: number;
  name: string;
  description: string;
  unified_job_type: UnifiedJobType;
  timeout?: number;
  job_type?: 'cleanup_jobs' | 'cleanup_activitystream' | 'cleanup_sessions' | 'cleanup_tokens';
}

export interface WizardFormValues {
  approval_description: string;
  approval_name: string;
  approval_timeout: number;
  node_alias: string;
  node_convergence: 'any' | 'all';
  node_days_to_keep: number;
  node_resource: NodeResource | null;
  node_type: UnifiedJobType;
}
