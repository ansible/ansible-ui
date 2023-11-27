interface Node {
  id: number;
  hostname: string;
  node_type: string;
  node_state: string;
  enabled: boolean;
}
interface Link {
  source: string;
  target: string;
  link_state: string;
}
export interface MeshVisualizer {
  nodes: Node[];
  links: Link[];
}
