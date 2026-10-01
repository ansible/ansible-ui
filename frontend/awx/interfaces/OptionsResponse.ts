export interface ActionsResponse {
  type: string;
  required: boolean;
  label: string;
  help_text?: string;
  filterable: boolean;
  default?: string | object;
  choices?: [string, string][];
  pattern?: string;
  pattern_description?: string;
  // Some backends use camelCase instead of snake_case
  patternDescription?: string;
  // Regex flags (e.g., 'u' for unicode, 'i' for case-insensitive)
  flags?: string;
}

export interface OptionsResponse<T extends ActionsResponse> {
  name: string;
  description: string;
  renders?: string[];
  parses?: string[];
  actions?: {
    [key: string]: {
      [key: string]: T;
    };
  };
  types?: string[];
  search_fields?: string[];
  related_search_fields?: string[];
  max_page_size?: number;
}
