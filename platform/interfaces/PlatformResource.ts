export interface PlatformResource {
  id: number;
  summary_fields: {
    resource?: {
      ansible_id: string;
      resource_type: string;
    };
  };
}
