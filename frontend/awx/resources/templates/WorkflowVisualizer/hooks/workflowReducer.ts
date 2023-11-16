import { WorkflowVisualizerAction, WorkflowVisualizerState } from '../types';
export const initialState = {
  showUnsavedChangesModal: false,
  nodesToDelete: [],
  unsavedChanges: false,
  nodes: [],
  showDeleteNodesModal: false,
  isLoading: true,
  isVisualizerExpanded: false,
  isToolbarKebabOpen: false,
  selectedNode: [],
  mode: undefined,
};

export function workflowVisualizerReducer(
  state: WorkflowVisualizerState,
  action: WorkflowVisualizerAction
): WorkflowVisualizerState {
  switch (action.type) {
    case 'CANCEL_ACTION':
      return { ...state, ...action.value };
    case 'SET_TOGGLE_VISUALIZER':
      return { ...state, isVisualizerExpanded: !state.isVisualizerExpanded };
    case 'SET_NODES':
      return {
        ...state,
        isLoading: action.value ? false : true,
        nodes: action.value,
      };
    case 'SET_TOOLBAR_KEBAB_OPEN':
      return { ...state, isToolbarKebabOpen: !state.isToolbarKebabOpen };

    case 'SET_NODES_TO_DELETE':
      return {
        ...state,
        nodesToDelete: [...state.nodesToDelete, ...action.value],
        nodes: state.nodes.filter((stateNode) => {
          return action.value.map((actionNode) => actionNode.id !== stateNode.id);
        }),
        showDeleteNodesModal: false,
        selectedNode: [],
        unsavedChanges: true,
      };
    case 'TOGGLE_CONFIRM_DELETE_MODAL':
      return {
        ...state,
        selectedNode: action.value,
        showDeleteNodesModal: !state.showDeleteNodesModal,
        mode: 'delete',
      };
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.value.node, mode: action.value.mode };
    default:
      throw new Error(`Unrecognized action type: ${action.type}`);
  }
}
