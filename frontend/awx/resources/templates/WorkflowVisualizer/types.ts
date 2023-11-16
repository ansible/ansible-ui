import {
  Edge,
  EdgeModel,
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
// WorkflowVisualizerState is used in WorkflowVisualizer.tsx and in the useReducer that handles state.  It does not contain a dispatch function.
export type WorkflowVisualizerState = {
  showUnsavedChangesModal: boolean;
  nodesToDelete: WorkflowNode[] | []; // could be used for delete all nodes also
  unsavedChanges: boolean;
  nodes: WorkflowNode[] | [];
  showDeleteNodesModal: boolean;
  isLoading: boolean;
  isVisualizerExpanded: boolean;
  isToolbarKebabOpen: boolean;
  selectedNode: WorkflowNode[] | [];
  mode: 'edit' | 'view' | 'add-link' | 'add-node-and-link' | 'delete' | undefined;
};

export type WorkflowVisualizerAction =
  | { type: 'CANCEL_ACTION'; value: WorkflowVisualizerState }
  | {
      type: 'TOGGLE_CONFIRM_DELETE_MODAL';
      value: WorkflowNode[];
    }
  | {
      type: 'SET_NODES_TO_DELETE';
      value: WorkflowNode[];
    }
  | {
      type: 'SET_NODES';
      value: WorkflowNode[];
    }
  | {
      type: 'SET_ALL_NODES_TO_DELETE';
      value: {
        nodesToDelete: WorkflowNode[] | [];
        nodes: WorkflowNode[] | [];
        unsavedChanges?: boolean;
      };
    }
  | {
      type: 'SET_SELECTED_NODE';
      value: {
        node: [WorkflowNode] | [];
        mode: 'edit' | 'view' | 'add-link' | 'add-node-and-link' | undefined;
      };
    }
  | { type: 'SET_TOGGLE_VISUALIZER' }
  | { type: 'SET_TOOLBAR_KEBAB_OPEN' };

export type WorkflowVisualizerDispatch = (action: WorkflowVisualizerAction) => void;
