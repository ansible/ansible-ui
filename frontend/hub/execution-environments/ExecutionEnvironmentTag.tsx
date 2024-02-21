export interface ExecutionEnvironmentTag {
  id: string;
  pulp_href: string;
  name: string;
  created_at: string;
  updated_at: string;
  tagged_manifest: {
    pulp_id: string;
    digest: string;
    schema_version: number;
    media_type: string;
    pulp_created: string;
  };
}
