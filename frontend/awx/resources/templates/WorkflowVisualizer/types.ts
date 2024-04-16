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
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

export type GraphNode = Node<NodeModel, GraphNodeData>;
export type GraphNodeData = {
  resource: WorkflowNode;
  launch_data: PromptFormValues;
};
export interface CustomNodeProps extends WithSelectionProps {
  element: GraphElement<
    ElementModel,
    {
      secondaryLabel?: string;
      resource: WorkflowNode;
      badge?: string;
      badgeTextColor?: string;
      badgeColor?: string;
      badgeBorderColor?: string;
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
  job_template = 'job_template',
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
  sourceNode: Node<NodeModel, GraphNodeData> | undefined;
  workflowTemplate: WorkflowJobTemplate;
}

export interface NodeResource {
  id: number;
  name: string;
  description: string;
  unified_job_type?: UnifiedJobType;
  timeout?: number;
  type?: string;
  inventory?: number;
  project?: number;
  ask_inventory_on_launch?: boolean;
  summary_fields?: { inventory: { kind: string } };
}

export interface PromptFormValues {
  inventory: Partial<Inventory> | null;
  credentials:
    | Credential[]
    | {
        id: number;
        name: string;
        credential_type: number;
        passwords_needed?: string[];
        vault_id?: string;
      }[];
  credential_passwords?: { [key: string]: string };
  instance_groups: { id: number; name: string }[];
  execution_environment: ExecutionEnvironment | { id: number; name: string } | null;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  job_slice_count: number;
  job_tags: { name: string }[];
  job_type: string;
  labels: { name: string; id: number }[];
  limit: string;
  scm_branch: string;
  skip_tags: { name: string }[];
  timeout: number;
  verbosity: 0 | 1 | 2 | 3 | 4 | 5;
  organization?: number | null;
  original?: {
    credentials?:
      | {
          id: number;
          name: string;
          credential_type: number;
          passwords_needed?: string[];
          vault_id?: string;
        }[]
      | Credential[];
    instance_groups?: { id: number; name: string }[];
    labels?: { name: string; id: number }[];
    launch_config?: LaunchConfiguration;
  };
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
  resource: AllResources | NodeResource | null;
  node_type: UnifiedJobType;
  node_status_type?: EdgeStatus;
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
  inventory?: Inventory;
  relatedJobTypeApiUrl?: string;
}

export type UnifiedJobType =
  | 'job'
  | 'workflow_job'
  | 'project_update'
  | 'workflow_approval'
  | 'inventory_update'
  | 'system_job';
