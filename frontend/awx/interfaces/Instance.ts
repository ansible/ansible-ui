export interface Instance {
  peers?: number[];
  peers_from_control_nodes: boolean;
  instance_type: string;
  instance_state: string;
  description: string;
  id: number;
  hostname: string;
  name: string;
  type: string;
  url: string;
  related: {
    jobs: string;
    instance_groups: string;
    peers: string;
    health_check?: string;
    install_bundle?: string;
    receptor_addresses: string;
  };
  summary_fields: {
    user_capabilities: {
      edit: boolean;
      delete: boolean;
    };
  };
  uuid: string;
  created: string;
  modified: string;
  last_seen: string;
  health_check_started: null | string;
  health_check_pending: boolean;
  last_health_check: undefined | string;
  errors: string;
  capacity_adjustment: string;
  version: string;
  capacity: number;
  consumed_capacity: number;
  percent_capacity_remaining: number;
  jobs_running: number;
  jobs_total: number;
  cpu: string;
  memory: number;
  cpu_capacity: number;
  mem_capacity: number;
  enabled: boolean;
  managed_by_policy: boolean;
  node_type: 'execution' | 'hop' | 'hybrid' | 'control';
  node_state: string;
  ip_address: null;
  listener_port: number;
  protocol: string;
  managed: boolean;
}

export interface Peer extends Instance {
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
