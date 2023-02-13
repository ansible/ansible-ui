import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { Organization } from '../../../interfaces/Organization';
import {
  JobTemplate,
  UnifiedJobTemplate,
  WorkflowJobTemplate,
} from '../../../interfaces/generated-from-swagger/api';
interface VisualizerWorkflowNode
  extends Omit<WorkflowNode, 'all_parents_must_converge' | 'identifier'> {
  fullUnifiedJobTemplate?: UnifiedJobTemplate;
  isInvalidTarget?: boolean;
  all_parents_must_converge: string;
  identifier: string;
  workflowMakerNodeId: number;
  nodeResource: JobTemplate | WorkflowJobTemplate;
  launchConfig?: Record<string, string | number | boolean> | undefined;
  promptValues?: Record<string, string | number | boolean | undefined> | undefined;
  originalNodeCredentials?: Credential[];
  linkType: string;
  isEdited: boolean;
  node_type: string;
}

interface NewNode {
  id: number;
  linkType: string;
  node_type: string;
  identifier: string;
  all_parents_must_converge: string;
  nodeResource: JobTemplate | WorkflowJobTemplate | UnifiedJobTemplate;
  promptValues?: Record<string, string | number | boolean | undefined> | undefined;
}

type Link = { id: number; originalNodeObject?: WorkflowNode };
type Position = { label: string; width: number; height: number; x: number; y: number };
type State = {
  addNodeSource: number;
  addLinkSourceNode: WorkflowNode;
  addLinkTargetNode: WorkflowNode;
  addNodeTarget: number;
  addingLink: boolean;
  nodePositions: { number: Position };
  contentError: null | Error;
  defaultOrganization: Organization;
  isLoading: boolean;
  linkToDelete: {
    isConvergenceLink: boolean;
    source: Link;
    target: Link;
  };
  linkToEdit: { id: number; source: Link; target: Link };
  links: {
    linkType: string;
    source: Link;
    target: Link;
  }[];
  nextNodeId: number;
  nodeToDelete: WorkflowNode;
  nodeToEdit: WorkflowNode;
  nodeToView: VisualizerWorkflowNode;
  nodes: {
    id: number;
    originalNodeObject?: VisualizerWorkflowNode | WorkflowNode;
    isInvalidLinkTarget?: boolean;
    fullUnifiedJobTemplate: UnifiedJobTemplate | { name: 'START'; id: number };
    all_parents_must_converge: string;
    nodeResource?: UnifiedJobTemplate;
    identifier: string;
    isDeleted?: boolean;
    isEdited?: boolean;
    linkType?: string;
    originalNodeCredentials?: Credential[];
    launchConfig?: Record<string, string | number | boolean> | undefined;
    promptValues?: Record<string, string | number | boolean | undefined> | undefined;
  }[];
  showDeleteAllNodesModal: boolean;
  showUnsavedChangesModal: boolean;
  showTools: boolean;
  showLegend?: boolean;
  unsavedChanges: boolean;
};
type Action = {
  translation?: () => string;
  type: string;
  nodes: [];
  node: VisualizerWorkflowNode | NewNode;
  link: { isConvergenceLink: boolean; target: Link; source: Link };
  linkType: string;
  value: string;
  sourceNodeId: number;
  targetNodeId: number;
};
export function initReducer() {
  return {
    addLinkSourceNode: null,
    addLinkTargetNode: null,
    addNodeSource: null,
    addNodeTarget: null,
    addingLink: false,
    contentError: null,
    defaultOrganization: null,
    isLoading: true,
    linkToDelete: null,
    linkToEdit: null,
    links: [],
    nextNodeId: 0,
    nodePositions: null,
    nodes: [],
    nodeToDelete: null,
    nodeToEdit: null,
    nodeToView: null,
    showDeleteAllNodesModal: false,
    showLegend: false,
    showTools: false,
    showUnsavedChangesModal: false,
    unsavedChanges: false,
  };
}

export function visualizerReducer(state: State, action: Action) {
  switch (action.type) {
    case 'CREATE_LINK':
      return createLink(state, action.linkType);
    case 'CREATE_NODE':
      return createNode(state, action.node);
    case 'CANCEL_LINK':
    case 'CANCEL_LINK_MODAL':
      return cancelLink(state);
    case 'CANCEL_NODE_MODAL':
      return {
        ...state,
        addNodeSource: null,
        addNodeTarget: null,
        nodeToEdit: null,
      };
    case 'DELETE_ALL_NODES':
      return deleteAllNodes(state);
    case 'DELETE_LINK':
      return deleteLink(state);
    case 'DELETE_NODE':
      return deleteNode(state);
    case 'GENERATE_NODES_AND_LINKS':
      return generateNodesAndLinks(state, action.nodes);
    case 'RESET':
      return initReducer();
    case 'SELECT_SOURCE_FOR_LINKING':
      return selectSourceForLinking(state, action.node);
    case 'SET_ADD_LINK_TARGET_NODE':
      return {
        ...state,
        addLinkTargetNode: action.value,
      };
    case 'SET_CONTENT_ERROR':
      return {
        ...state,
        contentError: action.value,
      };
    case 'SET_DEFAULT_ORGANIZATION':
      return {
        ...state,
        defaultOrganization: action.value,
      };
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.value,
      };
    case 'SET_LINK_TO_DELETE':
      return {
        ...state,
        linkToDelete: action.value,
      };
    case 'SET_LINK_TO_EDIT':
      return {
        ...state,
        linkToEdit: action.value,
      };
    case 'SET_NODES':
      return {
        ...state,
        nodes: action.value,
      };
    case 'SET_NODE_POSITIONS':
      return {
        ...state,
        nodePositions: action.value,
      };
    case 'SET_NODE_TO_DELETE':
      return {
        ...state,
        nodeToDelete: action.value,
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
    case 'START_ADD_NODE':
      return {
        ...state,
        addNodeSource: action.sourceNodeId,
        addNodeTarget: action.targetNodeId || null,
      };
    case 'START_DELETE_LINK':
      return startDeleteLink(state, action.link);
    case 'TOGGLE_DELETE_ALL_NODES_MODAL':
      return toggleDeleteAllNodesModal(state);
    case 'TOGGLE_LEGEND':
      return toggleLegend(state);
    case 'TOGGLE_TOOLS':
      return toggleTools(state);
    case 'TOGGLE_UNSAVED_CHANGES_MODAL':
      return toggleUnsavedChangesModal(state);
    case 'UPDATE_LINK':
      return updateLink(state, action.linkType);
    case 'UPDATE_NODE':
      return updateNode(state, action.node as VisualizerWorkflowNode);
    case 'REFRESH_NODE':
      return refreshNode(state, action.node as VisualizerWorkflowNode);
    default:
      throw new Error(`Unrecognized action type: ${action.type}`);
  }
}

function createLink(state: State, linkType: string) {
  const { addLinkSourceNode, addLinkTargetNode, links, nodes } = state;
  const newLinks = [...links];
  const newNodes = [...nodes];

  newNodes.forEach((node) => {
    node.isInvalidLinkTarget = false;
  });

  newLinks.push({
    source: {
      id: addLinkSourceNode.id,
    },
    target: {
      id: addLinkTargetNode.id,
    },
    linkType,
  });

  newLinks.forEach((link, index) => {
    if (link.source.id === 1 && link.target.id === addLinkTargetNode.id) {
      newLinks.splice(index, 1);
    }
  });

  return {
    ...state,
    addLinkSourceNode: null,
    addLinkTargetNode: null,
    addingLink: false,
    linkToEdit: null,
    links: newLinks,
    nodes: newNodes,
    unsavedChanges: true,
  };
}

function createNode(state: State, node: NewNode) {
  const { addNodeSource, addNodeTarget, links, nodes, nextNodeId } = state;
  const newNodes = [...nodes];
  const newLinks = [...links];

  newNodes.push({
    id: nextNodeId,
    fullUnifiedJobTemplate: node.nodeResource,
    isInvalidLinkTarget: false,
    promptValues: node.promptValues,
    all_parents_must_converge: node.all_parents_must_converge,
    identifier: node.identifier,
  });

  // Ensures that root nodes appear to always run
  // after "START"
  if (addNodeSource === 1) {
    node.linkType = 'always';
  }

  newLinks.push({
    source: {
      id: addNodeSource,
    },
    target: {
      id: nextNodeId,
    },
    linkType: node.linkType,
  });

  if (addNodeTarget) {
    newLinks.forEach((linkToCompare) => {
      if (linkToCompare.source.id === addNodeSource && linkToCompare.target.id === addNodeTarget) {
        linkToCompare.source = {
          id: nextNodeId,
        };
      }
    });
  }

  return {
    ...state,
    addNodeSource: null,
    addNodeTarget: null,
    links: newLinks,
    nextNodeId: nextNodeId + 1,
    nodes: newNodes,
    unsavedChanges: true,
  };
}

function cancelLink(state: State) {
  const { nodes } = state;
  const newNodes = [...nodes];

  newNodes.forEach((node) => {
    node.isInvalidLinkTarget = false;
  });

  return {
    ...state,
    addLinkSourceNode: null,
    addLinkTargetNode: null,
    addingLink: false,
    linkToEdit: null,
    nodes: newNodes,
  };
}

function deleteAllNodes(state: State) {
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

function deleteLink(state: State) {
  const { links, linkToDelete } = state;
  const newLinks = [...links];

  for (let i = newLinks.length; i--; ) {
    const link = newLinks[i];

    if (link.source.id === linkToDelete?.source.id && link.target.id === linkToDelete.target.id) {
      newLinks.splice(i, 1);
    }
  }

  if (!linkToDelete.isConvergenceLink) {
    // Add a new link from the start node to the orphaned node
    newLinks.push({
      source: {
        id: 1,
      },
      target: {
        id: linkToDelete.target.id,
      },
      linkType: 'always',
    });
  }

  return {
    ...state,
    links: newLinks,
    linkToDelete: null,
    unsavedChanges: true,
  };
}

function addLinksFromParentsToChildren(
  parents: number[],
  children: VisualizerWorkflowNode[],
  newLinks: {
    linkType: string;
    source: Link;
    target: Link;
  }[],
  linkParentMapping: Record<number, number[]> = {}
) {
  parents.forEach((parentId) => {
    children.forEach((child) => {
      if (parentId === 1) {
        // We only want to create a link from the start node to this node if it
        // doesn't have any other parents
        if (linkParentMapping[child.id].length === 1) {
          newLinks.push({
            source: {
              id: parentId,
            },
            target: {
              id: child.id,
            },
            linkType: 'always',
          });
        }
      } else if (!linkParentMapping[child.id].includes(parentId)) {
        newLinks.push({
          source: {
            id: parentId,
          },
          target: {
            id: child.id,
          },
          linkType: child.linkType,
        });
      }
    });
  });
}

function removeLinksFromDeletedNode(
  nodeId: number,
  newLinks: { linkType: string; source: Link; target: Link }[]
) {
  const parents = [];
  const children = [];

  const linkParentMapping: Record<number, number[]> = {};
  for (let i = newLinks.length; i--; ) {
    const link = newLinks[i];

    if (!linkParentMapping[link.target.id]) {
      linkParentMapping[link.target.id] = [];
    }

    linkParentMapping[link.target.id].push(link.source.id);

    if (link.source.id === nodeId || link.target.id === nodeId) {
      if (link.source.id === nodeId) {
        children.push({
          id: link.target.id,
          linkType: link.linkType,
        });
      } else if (link.target.id === nodeId) {
        parents.push(link.source.id);
      }
      newLinks.splice(i, 1);
    }
  }
}

function deleteNode(state: State) {
  const { links, nodes, nodeToDelete } = state;
  if (!nodes.length) {
    return;
  }
  const nodeId = nodeToDelete.id;
  const newNodes = [...nodes];
  const newLinks = [...links];

  newNodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, isDeleted: true };
    }
  });

  // Update the links
  const parents: number[] = [];
  const children: VisualizerWorkflowNode[] = [];
  const linkParentMapping: Record<number, number[]> = {};

  removeLinksFromDeletedNode(nodeId, newLinks);

  addLinksFromParentsToChildren(parents, children, newLinks, linkParentMapping);

  return {
    ...state,
    links: newLinks,
    nodeToDelete: null,
    nodes: newNodes,
    unsavedChanges: true,
  };
}

function generateNodes(workflowNodes: VisualizerWorkflowNode[]) {
  interface NodeObject {
    id: number;
    originalNodeObject?: WorkflowNode;
    fullUnifiedJobTemplate?: UnifiedJobTemplate | { name: string };
  }
  const allNodeIds = [] as number[];
  const chartNodeIdToIndexMapping: Record<number, number> = {};
  const nodeIdToChartNodeIdMapping: Record<number, number> = {};
  let nodeIdCounter = 2;
  const arrayOfNodesForChart: (
    | { id: number; fullUnifiedJobTemplate?: UnifiedJobTemplate | { name: string } }
    | NodeObject
  )[] = [
    {
      id: 1,
      fullUnifiedJobTemplate: {
        name: 'START',
      },
    },
  ];
  workflowNodes.forEach((node) => {
    node.workflowMakerNodeId = nodeIdCounter;
    const nodeObj = {
      id: nodeIdCounter,
      originalNodeObject: node,
    };

    if (node.summary_fields?.unified_job_template?.unified_job_type === 'workflow_approval') {
      node.fullUnifiedJobTemplate = {
        ...node.summary_fields.unified_job_template,
        type: 'workflow_approval_template',
      };
    }

    arrayOfNodesForChart.push(nodeObj);
    allNodeIds.push(node.id);
    nodeIdToChartNodeIdMapping[node.id] = node.workflowMakerNodeId;
    chartNodeIdToIndexMapping[nodeIdCounter] = nodeIdCounter - 1;
    nodeIdCounter++;
  });

  return [
    arrayOfNodesForChart,
    allNodeIds,
    nodeIdToChartNodeIdMapping,
    chartNodeIdToIndexMapping,
    nodeIdCounter,
  ];
}

function generateLinks(
  workflowNodes: VisualizerWorkflowNode[],
  chartNodeIdToIndexMapping: Record<number, number> = {},
  nodeIdToChartNodeIdMapping: Record<number, number> = {},
  arrayOfNodesForChart: VisualizerWorkflowNode[]
) {
  const arrayOfLinksForChart: { source: Link; target: Link; linkType: string }[] = [];
  const nonRootNodeIds: number[] = [];
  workflowNodes.forEach((node) => {
    const sourceIndex = chartNodeIdToIndexMapping[node.workflowMakerNodeId];

    node.success_nodes.forEach((nodeId) => {
      const targetIndex = chartNodeIdToIndexMapping[nodeIdToChartNodeIdMapping[nodeId]];
      arrayOfLinksForChart.push({
        source: arrayOfNodesForChart[sourceIndex],
        target: arrayOfNodesForChart[targetIndex],
        linkType: 'success',
      });
      nonRootNodeIds.push(nodeId);
    });
    node.failure_nodes.forEach((nodeId) => {
      const targetIndex = chartNodeIdToIndexMapping[nodeIdToChartNodeIdMapping[nodeId]];
      arrayOfLinksForChart.push({
        source: arrayOfNodesForChart[sourceIndex],
        target: arrayOfNodesForChart[targetIndex],
        linkType: 'failure',
      });
      nonRootNodeIds.push(nodeId);
    });
    node.always_nodes.forEach((nodeId) => {
      const targetIndex = chartNodeIdToIndexMapping[nodeIdToChartNodeIdMapping[nodeId]];
      arrayOfLinksForChart.push({
        source: arrayOfNodesForChart[sourceIndex],
        target: arrayOfNodesForChart[targetIndex],
        linkType: 'always',
      });
      nonRootNodeIds.push(nodeId);
    });
  });

  return [arrayOfLinksForChart, nonRootNodeIds];
}

function generateNodesAndLinks(state: State, workflowNodes: VisualizerWorkflowNode[]) {
  const [
    arrayOfNodesForChart,
    allNodeIds,
    nodeIdToChartNodeIdMapping,
    chartNodeIdToIndexMapping,
    nodeIdCounter,
  ] = generateNodes(workflowNodes) as [
    arrayOfNodesForChart: VisualizerWorkflowNode[],
    allNodeIds: number[],
    nodeIdToChartNodeIdMapping: Record<number, number>,
    chartNodeIdToIndexMapping: Record<number, number>,
    nodeIdCounter: number
  ];
  const [arrayOfLinksForChart, nonRootNodeIds] = generateLinks(
    workflowNodes,
    chartNodeIdToIndexMapping,
    nodeIdToChartNodeIdMapping,
    arrayOfNodesForChart
  ) as [{ source: Link; target: Link; linkType: string }[], number[]];

  const uniqueNonRootNodeIds = Array.from(new Set(nonRootNodeIds));

  const rootNodes: number[] = allNodeIds.filter((nodeId) => !uniqueNonRootNodeIds.includes(nodeId));

  rootNodes.forEach((rootNodeId: number) => {
    const targetIndex: number = chartNodeIdToIndexMapping[nodeIdToChartNodeIdMapping[rootNodeId]];
    arrayOfLinksForChart.push({
      source: arrayOfNodesForChart[0],
      target: arrayOfNodesForChart[targetIndex],
      linkType: 'always',
    });
  });

  return {
    ...state,
    links: arrayOfLinksForChart,
    nodes: arrayOfNodesForChart,
    nextNodeId: nodeIdCounter,
  };
}

function selectSourceForLinking(state: State, sourceNode: NewNode | VisualizerWorkflowNode) {
  const { links, nodes } = state;
  const newNodes = [...nodes];
  const parentMap: Record<number, { parents: number[]; traversed: boolean }> = {};
  const invalidLinkTargetIds: number[] = [];
  // Find and mark any ancestors as disabled to prevent cycles
  links.forEach((link) => {
    // id=1 is our artificial root node so we don't care about that
    if (link.source.id === 1) {
      return;
    }
    if (link.source.id === sourceNode.id) {
      // Disables direct children from the add link process
      invalidLinkTargetIds.push(link.target.id);
    }
    if (!parentMap[link.target.id]) {
      parentMap[link.target.id] = {
        parents: [],
        traversed: false,
      };
    }
    parentMap[link.target.id].parents.push(link.source.id);
  });

  const getAncestors = (id: number) => {
    if (parentMap[id] && !parentMap[id].traversed) {
      parentMap[id].parents.forEach((parentId) => {
        invalidLinkTargetIds.push(parentId);
        getAncestors(parentId);
      });
      parentMap[id].traversed = true;
    }
  };

  getAncestors(sourceNode.id);

  // Filter out the duplicates
  invalidLinkTargetIds
    .filter((element, index, array) => index === array.indexOf(element))
    .forEach((ancestorId) => {
      newNodes.forEach((node) => {
        if (node.id === ancestorId) {
          node.isInvalidLinkTarget = true;
        }
      });
    });

  return {
    ...state,
    addLinkSourceNode: sourceNode,
    addingLink: true,
    nodes: newNodes,
  };
}

function startDeleteLink(state: State, link: { isConvergenceLink: boolean; target: Link }) {
  const { links } = state;

  const parentMap: Record<number, number[]> = {};
  links.forEach((existingLink: { target: Link; source: Link }) => {
    if (!parentMap[existingLink.target.id]) {
      parentMap[existingLink.target.id] = [];
    }
    parentMap[existingLink.target.id].push(existingLink.source.id);
  });

  link.isConvergenceLink = parentMap[link.target.id].length > 1;

  return {
    ...state,
    linkToDelete: link,
  };
}

function toggleDeleteAllNodesModal(state: State) {
  const { showDeleteAllNodesModal } = state;
  return {
    ...state,
    showDeleteAllNodesModal: !showDeleteAllNodesModal,
  };
}

function toggleLegend(state: State) {
  const { showLegend } = state;
  return {
    ...state,
    showLegend: !showLegend,
  };
}

function toggleTools(state: State) {
  const { showTools } = state;
  return {
    ...state,
    showTools: !showTools,
  };
}

function toggleUnsavedChangesModal(state: State) {
  const { showUnsavedChangesModal } = state;
  return {
    ...state,
    showUnsavedChangesModal: !showUnsavedChangesModal,
  };
}

function updateLink(state: State, linkType: string) {
  const { linkToEdit, links } = state;
  const newLinks = [...links];

  newLinks.forEach((link) => {
    if (link.source.id === linkToEdit.source.id && link.target.id === linkToEdit.target.id) {
      link.linkType = linkType;
    }
  });

  return {
    ...state,
    linkToEdit: null,
    links: newLinks,
    unsavedChanges: true,
  };
}

function updateNode(state: State, editedNode: VisualizerWorkflowNode) {
  const { nodeToEdit, nodes } = state;
  const { nodeResource, launchConfig, promptValues, all_parents_must_converge, identifier } =
    editedNode;
  const newNodes = [...nodes];

  const matchingNode = newNodes.find((node) => node.id === nodeToEdit.id);
  if (matchingNode) {
    matchingNode.all_parents_must_converge = all_parents_must_converge;
    matchingNode.fullUnifiedJobTemplate = nodeResource;
    matchingNode.isEdited = true;
    matchingNode.launchConfig = launchConfig;
    matchingNode.identifier = identifier;
    if (promptValues) {
      matchingNode.promptValues = promptValues;
    } else {
      delete matchingNode.promptValues;
    }
  }

  return {
    ...state,
    nodeToEdit: null,
    nodes: newNodes,
    unsavedChanges: true,
  };
}

function refreshNode(state: State, refreshedNode: VisualizerWorkflowNode) {
  const { nodeToView, nodes } = state;
  const newNodes = [...nodes];

  const matchingNode = newNodes.find((node) => node.id === nodeToView.id);

  if (refreshedNode.fullUnifiedJobTemplate && matchingNode) {
    matchingNode.fullUnifiedJobTemplate = refreshedNode.fullUnifiedJobTemplate;
  }

  if (refreshedNode.originalNodeCredentials && matchingNode) {
    matchingNode.originalNodeCredentials = refreshedNode.originalNodeCredentials;
  }

  return {
    ...state,
    nodes: newNodes,
    nodeToView: matchingNode,
  };
}
