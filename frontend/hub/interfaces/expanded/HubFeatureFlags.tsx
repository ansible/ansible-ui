export type HubFeatureFlags = {
  // execution environments
  container_signing: boolean;
  execution_environments: boolean;

  // keycloak login screen
  external_authentication: boolean;

  // community mode
  ai_deny_index: boolean;
  display_repositories: boolean;
  legacy_roles: boolean;

  // collection signing
  can_create_signatures: boolean;
  can_upload_signatures: boolean;
  collection_auto_sign: boolean;
  collection_signing: boolean;
  display_signatures: boolean;
  require_upload_signatures: boolean;
  signatures_enabled: boolean;

  // errors
  _messages: string[];
};
