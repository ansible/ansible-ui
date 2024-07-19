export interface Service {
  name: string;
  id: number;
  url: string;
  created: string;
  created_by: string | null;
  modified: string;
  modified_by: string | null;
  summary_fields: {
    port?: {
      id: number;
    };
    service_cluster?: {
      id: number;
      service_type: string;
    };
  };
  port: number;
  service_cluster: number;
  service_port: number;
  is_service_https: boolean;
  gateway_path: string;
  description: string | null;
  api_slug: string;
}
