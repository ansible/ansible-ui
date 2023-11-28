export interface PluginConfiguration {
  name: string;
  help_text: string;
  required: boolean;
  default?: string;
  type: string;
  ui_field_label?: string;
}

export interface AuthenticatorPlugin {
  type: string;
  configuration_schema: PluginConfiguration[];
  documentation_url: string;
}

export interface AuthenticatorPlugins {
  authenticators: AuthenticatorPlugin[];
}
