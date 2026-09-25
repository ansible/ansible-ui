import { AuthenticatorTypeEnum } from './Authenticator';

export interface PluginConfiguration {
  name: string;
  help_text: string;
  required: boolean;
  default?: unknown;
  type: string;
  ui_field_label?: string;
  choices?: { [name: string]: string };
  pattern?: string;
  pattern_description?: string;
  /** camelCase variant emitted by the Gateway authenticator-plugins API. */
  patternDescription?: string;
  flags?: string;
}

export interface AuthenticatorPlugin {
  type: AuthenticatorTypeEnum;
  configuration_schema: PluginConfiguration[];
  documentation_url: string;
}

export interface AuthenticatorPlugins {
  authenticators: AuthenticatorPlugin[];
}
