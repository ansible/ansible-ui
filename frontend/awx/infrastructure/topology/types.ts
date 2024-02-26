import {
  Node,
  EdgeModel,
  NodeModel,
  NodeStatus,
  GraphElement,
  WithSelectionProps,
} from '@patternfly/react-topology';

export interface MeshNode {
  id: string;
  x: number;
  y: number;
  node_type: string;
  hostname: string;
  node_state: string;
}

export interface MeshLink {
  link_state: string;
  source: {
    id: string;
    hostname: string;
  };
  target: {
    id: string;
    hostname: string;
  };
}

export interface WebWorkerResponse {
  type: string;
  progress: number;
  nodes: MeshNode[];
  links: MeshLink[];
}

export interface CustomNodeProps extends WithSelectionProps {
  element: Node<NodeModel, { nodeType: string; nodeStatus: string }>;
}

export interface CustomEdgeProps {
  element: GraphElement<
    EdgeModel,
    {
      tagStatus: NodeStatus;
      endTerminalStatus: NodeStatus;
    }
  >;
}
