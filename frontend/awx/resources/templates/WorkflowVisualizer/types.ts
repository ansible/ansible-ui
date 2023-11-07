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

export type WorkflowVisualizerNode = WorkflowNode & { isDeleted?: boolean };

export type WorkflowVisualizerState = {
  showUnsavedChangesModal: boolean;
  nodesToDelete: WorkflowVisualizerNode[] | []; // could be used for delete all nodes also
  unsavedChanges: boolean;
  nodeToEdit: WorkflowVisualizerNode | undefined;
  nodeToView: WorkflowVisualizerNode | undefined;
  nodes: WorkflowVisualizerNode[] | [];
  showDeleteAllNodesModal: boolean;
  isLoading: boolean;
};

export type WorkflowVisualizerAction =
  | { type: 'DELETE_ALL_NODES'; value: WorkflowVisualizerNode }
  | { type: 'SET_NODES'; value: WorkflowVisualizerNode[] | [] }
  | {
      type: 'DELETE_NODE' | 'SET_NODE_TO_EDIT' | 'SET_NODE_TO_VIEW';
      value: WorkflowVisualizerNode | undefined;
    }
  | {
      type:
        | 'SET_IS_LOADING'
        | 'SET_SHOW_DELETE_ALL_NODES_MODAL'
        | 'TOGGLE_DELETE_ALL_NODES_MODAL'
        | 'TOGGLE_UNSAVED_CHANGES_MODAL';
      value: boolean;
    }
  | { type: 'SET_NODES_TO_DELETE'; value: WorkflowVisualizerNode[] | [] }
  | { type: string; value: never };
