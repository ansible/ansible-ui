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
import type { Credential } from '../../../interfaces/Credential';
import type { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import type { Inventory } from '../../../interfaces/Inventory';
import type { InventorySource } from '../../../interfaces/InventorySource';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { LaunchConfiguration } from '../../../interfaces/LaunchConfiguration';
import type { Project } from '../../../interfaces/Project';
import type { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import type { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode, UnifiedJobType } from '../../../interfaces/WorkflowNode';

export type GraphNode = Node<NodeModel, GraphNodeData>;
export type GraphNodeData = {
  resource: WorkflowNode;
  launch_data?: PromptFormValues;
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
  unified_job_type?: UnifiedJobType;
  timeout?: number;
}

export interface PromptFormValues {
  inventory: Inventory;
  credentials: Credential[];
  credential_passwords: { [key: string]: string };
  instance_groups: { id: number; name: string }[];
  execution_environment: ExecutionEnvironment;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  job_slice_count: number;
  job_tags: { name: string }[];
  job_type: string;
  labels: { name: string; id?: number }[];
  limit: string;
  scm_branch: string;
  skip_tags: { name: string }[];
  timeout: number;
  verbosity: number;
  organization: number;
}

export type AllResources =
  | InventorySource
  | JobTemplate
  | Project
  | SystemJobTemplate
  | WorkflowApproval
  | WorkflowJobTemplate;

export interface WizardFormValues {
  approval_description: string;
  approval_name: string;
  approval_timeout: number;
  node_alias: string;
  node_convergence: 'any' | 'all';
  node_days_to_keep: number;
  node_resource: AllResources | NodeResource | null;
  node_type: UnifiedJobType;
  node_status_type: EdgeStatus;
  launch_config: LaunchConfiguration;
  prompt: PromptFormValues;
}
