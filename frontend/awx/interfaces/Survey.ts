export interface Survey {
  name: string;
  description: string;
  spec: Spec[];
}

export interface SurveyCondition {
  variable: string;
  operator: 'eq' | 'neq' | 'in' | 'notin' | 'gt' | 'lt' | 'gte' | 'lte' | 'is_set' | 'is_not_set';
  value?: string | number | string[];
}

export interface Spec {
  question_name: string;
  question_description: string;
  required: boolean;
  type: string;
  variable: string;
  min: number;
  max: number;
  default: string | number;
  choices: string[] | string;
  new_question: boolean;
  category?: string;
  page?: number;
  conditions?: SurveyCondition[];
  condition_logic?: 'and' | 'or';
}
