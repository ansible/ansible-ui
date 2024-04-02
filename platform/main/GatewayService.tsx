interface Related {
  created_by: string;
  http_port: string;
  modified_by: string;
  service_cluster: string;
}

interface ModifiedBy {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface CreatedBy {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface HttpPort {
  id: number;
  name: string;
}

interface ServiceCluster {
  id: number;
  service_type: string;
}

interface SummaryFields {
  modified_by: ModifiedBy;
  created_by: CreatedBy;
  http_port: HttpPort;
  service_cluster: ServiceCluster;
}

export interface GatewayService {
  name: string;
  id: number;
  url: string;
  created: string;
  created_by: number;
  modified: string;
  modified_by: number;
  related: Related;
  summary_fields: SummaryFields;
  http_port: number;
  service_cluster: number;
  service_port: number;
  is_service_https: boolean;
  service_path: string;
  gateway_path: string;
  description: null | string;
  api_slug: string;
  enable_gateway_auth: boolean;
  order: number;
}
