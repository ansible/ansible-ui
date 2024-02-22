import { AuthenticatorTypeEnum } from './Authenticator';

export interface PluginConfiguration {
  name: string;
  help_text: string;
  required: boolean;
  default?: string;
  type: string;
  ui_field_label?: string;
  choices?: { [name: string]: string };
}

export interface AuthenticatorPlugin {
  type: AuthenticatorTypeEnum;
  configuration_schema: PluginConfiguration[];
  documentation_url: string;
}

export interface AuthenticatorPlugins {
  authenticators: AuthenticatorPlugin[];
}
