export type GatewaySettingsOption =
  | StringOption
  | IntegerOption
  | BooleanOption
  | UrlOption
  | FieldOption
  | StringArrayOption;

/** OPTIONS metadata used by PageForm for pattern validation (CleanText / DRF). */
export interface GatewaySettingsOptionValidation {
  pattern?: string;
  pattern_description?: string;
  patternDescription?: string;
  flags?: string;
}

interface StringOption extends GatewaySettingsOptionValidation {
  type: 'string';
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string;
}

interface StringArrayOption {
  type: 'string_array';
  required: boolean;
  read_only: boolean;
  label: string;
  help_text: string;
  default: string[];
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

export interface UrlOption extends GatewaySettingsOptionValidation {
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
