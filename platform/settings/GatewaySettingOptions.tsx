export type GatewaySettingsOption =
  | StringOption
  | IntegerOption
  | BooleanOption
  | UrlOption
  | FieldOption;

interface StringOption {
  type: 'string';
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
}

interface IntegerOption {
  type: 'integer';
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: number;
}

interface BooleanOption {
  type: 'boolean';
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: boolean;
}

interface UrlOption {
  type: 'url';
  required: false;
  read_only: false;
  label: string;
  help_text: string;
  default: string;
}

interface FieldOption {
  type: 'field';
  required: false;
  read_only: false;
  label: string;
  help_text: string;
}
