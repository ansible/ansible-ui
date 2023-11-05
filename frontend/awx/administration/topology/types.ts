import { ElementModel, GraphElement, NodeStatus } from '@patternfly/react-topology';

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

export interface CustomNodeProps {
  element: GraphElement<ElementModel, { nodeType: string }>;
  onSelect: (e: React.MouseEvent) => void;
  selected: boolean;
}
export interface CustomEdgeProps {
  element: GraphElement<
    ElementModel,
    {
      tagStatus: NodeStatus;
      endTerminalStatus: NodeStatus;
    }
  >;
}
