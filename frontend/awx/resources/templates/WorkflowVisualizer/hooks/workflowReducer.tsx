import { WorkflowVisualizerAction, WorkflowVisualizerState } from '../types';

export function initReducer() {
  return {
    showUnsavedChangesModal: false,
    nodesToDelete: [], // could be used for delete all nodes also
    unsavedChanges: false,
    nodeToEdit: undefined,
    nodeToView: undefined,
    nodes: [],
    showDeleteAllNodesModal: false,
    isLoading: true,
  };
}

export function workflowVisualizerReducer(
  state: WorkflowVisualizerState,
  action: WorkflowVisualizerAction
): WorkflowVisualizerState {
  switch (action.type) {
    case 'DELETE_ALL_NODES':
      return deleteAllNodes(state);
    case 'RESET':
      return initReducer();
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.value,
      };
    case 'SET_NODES':
      return {
        ...state,
        isLoading: false,
        nodes: action.value,
      };
    case 'SET_NODES_TO_DELETE':
      return {
        ...state,
        nodesToDelete: [...state.nodesToDelete, ...action.value],
      };
    case 'SET_NODE_TO_EDIT':
      return {
        ...state,
        nodeToEdit: action.value,
      };
    case 'SET_NODE_TO_VIEW':
      return {
        ...state,
        nodeToView: action.value,
      };
    case 'SET_SHOW_DELETE_ALL_NODES_MODAL':
      return {
        ...state,
        showDeleteAllNodesModal: action.value,
      };
    case 'TOGGLE_DELETE_ALL_NODES_MODAL':
      return toggleDeleteAllNodesModal(state);
    case 'TOGGLE_UNSAVED_CHANGES_MODAL':
      return toggleUnsavedChangesModal(state);
    default:
      throw new Error(`Unrecognized action type: ${action.type}`);
  }
}

function deleteAllNodes(state: WorkflowVisualizerState) {
  const { nodes } = state;
  return {
    ...state,
    addLinkSourceNode: null,
    addLinkTargetNode: null,
    addingLink: false,
    links: [],
    nodes: nodes.map((node) => {
      if (node.id !== 1) {
        node.isDeleted = true;
      }

      return node;
    }),
    showDeleteAllNodesModal: false,
    unsavedChanges: true,
  };
}

function toggleDeleteAllNodesModal(state: WorkflowVisualizerState) {
  const { showDeleteAllNodesModal } = state;
  return {
    ...state,
    showDeleteAllNodesModal: !showDeleteAllNodesModal,
  };
}

function toggleUnsavedChangesModal(state: WorkflowVisualizerState) {
  const { showUnsavedChangesModal } = state;
  return {
    ...state,
    showUnsavedChangesModal: !showUnsavedChangesModal,
  };
}
