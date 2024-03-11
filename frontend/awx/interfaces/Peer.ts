export interface Peer {
  id: number;
  url: string;
  address: string;
  port: number;
  protocol: string;
  websocket_path: string;
  is_internal: boolean;
  canonical: boolean;
  instance: number;
  peers_from_control_nodes: boolean;
  full_address: string;
  name: string;
}
