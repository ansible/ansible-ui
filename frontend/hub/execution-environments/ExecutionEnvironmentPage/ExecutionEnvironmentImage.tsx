export interface ImageLayer {
  digest: string;
  size: number;
}

export interface ImageManifest {
  os: string;
  architecture: string;
  os_version: string;
  os_features: string;
  features: string;
  variant: string;
  digest: string;
}

export interface ExecutionEnvironmentImage {
  id: string;
  pulp_href: string;
  digest: string;
  schema_version: number;
  media_type: string;
  config_blob: {
    digest?: string;
    data?: {
      history?: {
        created: string;
        created_by: string;
        empty_layer: boolean;
      }[];
      config?: {
        Env: string[];
      };
    };
  };
  tags: string[];
  created_at: string;
  updated_at: string;
  layers: ImageLayer[];
  image_manifests: ImageManifest[];
}
